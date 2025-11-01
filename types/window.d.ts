import type { T_CONFIG_MAP } from '@shared/types/infra';

type TKeycloakLike = {
  logout: () => void;
  login: () => void;
} & Record<string, unknown>;

declare global {
  interface Window {
    urlConfig?: T_CONFIG_MAP;
    token?: string;
    keycloak?: TKeycloakLike;
  }
}

export {};