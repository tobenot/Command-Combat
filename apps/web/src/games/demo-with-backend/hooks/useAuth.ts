import { useState, useEffect } from 'react';
import { trpc } from '../services/trpc';

interface User {
	userId: string;
}

export const useAuth = () => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem('sessionToken');
		if (token) {
			try {
				const payload = JSON.parse(atob(token.split('.')[1]));
				if (payload.exp * 1000 > Date.now()) {
					setUser({ userId: payload.userId });
				} else {
					localStorage.removeItem('sessionToken');
				}
			} catch (error) {
				localStorage.removeItem('sessionToken');
			}
		}
		setIsLoading(false);
	}, []);

    const login = async (email: string) => {
		try {
			await (trpc as any).auth.requestLoginLink.mutate({ email });
			return { success: true };
		} catch (error) {
			return { success: false, error: error instanceof Error ? error.message : '登录失败' };
		}
	};

	const requestVerificationCode = async (email: string) => {
		try {
			// 使用融合邮件接口，同时发送魔法链接和验证码
			const result = await (trpc as any).auth.requestLoginLink.mutate({ email });
			return { success: true, challengeId: result.challengeId };
		} catch (error) {
			return { success: false, error: error instanceof Error ? error.message : '发送验证码失败' };
		}
	};

	const verifyCode = async (challengeId: string, code: string) => {
		try {
			const result = await (trpc as any).auth.verifyEmailCode.mutate({ challengeId, code });
			localStorage.setItem('sessionToken', result.sessionToken);
			const payload = JSON.parse(atob(result.sessionToken.split('.')[1]));
			setUser({ userId: payload.userId });
			return { success: true };
		} catch (error) {
			return { success: false, error: error instanceof Error ? error.message : '验证码验证失败' };
		}
	};

	const verifyToken = async (token: string) => {
		try {
			const result = await (trpc as any).auth.verifyMagicToken.query({ token });
			localStorage.setItem('sessionToken', result.sessionToken);
			const payload = JSON.parse(atob(result.sessionToken.split('.')[1]));
			setUser({ userId: payload.userId });
			return { success: true };
		} catch (error) {
			return { success: false, error: error instanceof Error ? error.message : '验证失败' };
		}
	};

	const logout = () => {
		localStorage.removeItem('sessionToken');
		setUser(null);
	};

	return {
		user,
		isLoading,
		login,
		requestVerificationCode,
		verifyCode,
		verifyToken,
		logout,
	};
}; 