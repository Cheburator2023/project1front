export type T_KEYCLOAK_USER = {
	exp: number;
	iat: number;
	auth_time: number;
	jti: string;
	iss: string;
	aud: string | string[];
	sub: string;
	typ: string;
	azp: string;
	nonce: string;
	session_state: string;
	acr: string;
	"allowed-origins": string[];
	realm_access: {
		roles: string[];
	};
	resource_access: Record<string, { roles: string[] }>;
	scope: string;
	email_verified: boolean;
	roles: string[];
	name: string;
	groups: string[];
	preferred_username: string;
	given_name: string;
	family_name: string;
	email?: string;
};

export type T_KEYCLOAK_INSTANCE = {
	authenticated: boolean;
	tokenParsed: T_KEYCLOAK_USER;
	idTokenParsed: T_KEYCLOAK_USER;
	refreshTokenParsed: Pick<T_KEYCLOAK_USER, 'exp' | 'iat' | 'jti' | 'iss' | 'sub' | 'typ' | 'azp' | 'nonce' | 'session_state' | 'scope'>;
	token: string;
	idToken: string;
	refreshToken: string;
	sessionId: string;
	subject: string;
	realmAccess: { roles: string[] };
	resourceAccess: Record<string, { roles: string[] }>;
	timeSkew: number;
	logout: (options?: { redirectUri?: string }) => Promise<void>;
	updateToken: (minValidity?: number) => Promise<boolean>;
};

export type T_CONFIG_MAP = {
	SUM_FRONTEND: string;
	SUM_API: string;
	SUM_RM_FRONTEND: string;
	SMART_ANKETA_FRONTEND: string;
	SMART_ANKETA_API: string;
	SUM_RM_API: string;
	KEYCLOAK_URL: string;
	KABVAL_URL: string;
};

declare global {
	interface Window {
		keycloak?: T_KEYCLOAK_INSTANCE;
		token?: string;
		urlConfig?: T_CONFIG_MAP;
	}
}
