export const USER_ROLES = {
  BIBLIOTHECAIRE: 'BIBLIOTHECAIRE',
  LECTEUR: 'LECTEUR',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
