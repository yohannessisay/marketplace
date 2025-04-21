export interface Config {
  VITE_API_BASE_URL: string;
  VITE_SOCKET_URL: string;
  agent: {
    BLOCKED_ACCESS_CHECK_ENABLED: boolean;
    KYC_VERIFICATION_CHECK_ENABLED: boolean;
    ONBOARDING_STAGE_CHECK_ENABLED: boolean;
  };
  farmer: {
    BLOCKED_ACCESS_CHECK_ENABLED: boolean;
    KYC_VERIFICATION_CHECK_ENABLED: boolean;
    ONBOARDING_STAGE_CHECK_ENABLED: boolean;
  };
  buyer: {
    BLOCKED_ACCESS_CHECK_ENABLED: boolean;
    KYC_VERIFICATION_CHECK_ENABLED: boolean;
    ONBOARDING_STAGE_CHECK_ENABLED: boolean;
  };
  BLOCKED_ACCESS_CHECK_ENABLED: boolean;
  KYC_VERIFICATION_CHECK_ENABLED: boolean;
  ONBOARDING_STAGE_CHECK_ENABLED: boolean;
}

function loadConfig(): Config {
  const requiredVars = [
    "VITE_API_BASE_URL",
    "VITE_SOCKET_URL",

    "VITE_BLOCKED_ACCESS_CHECK_ENABLED",
    "VITE_KYC_VERIFICATION_CHECK_ENABLED",
    "VITE_ONBOARDING_STAGE_CHECK_ENABLED",

    "VITE_AGENT_BLOCKED_ACCESS_CHECK_ENABLED",
    "VITE_AGENT_KYC_VERIFICATION_CHECK_ENABLED",
    "VITE_AGENT_ONBOARDING_STAGE_CHECK_ENABLED",

    "VITE_FARMER_BLOCKED_ACCESS_CHECK_ENABLED",
    "VITE_FARMER_KYC_VERIFICATION_CHECK_ENABLED",
    "VITE_FARMER_ONBOARDING_STAGE_CHECK_ENABLED",

    "VITE_BUYER_BLOCKED_ACCESS_CHECK_ENABLED",
    "VITE_BUYER_KYC_VERIFICATION_CHECK_ENABLED",
    "VITE_BUYER_ONBOARDING_STAGE_CHECK_ENABLED",
  ];

  for (const key of requiredVars) {
    if (!import.meta.env[key]) {
      throw new Error(
        `${key} is not set in the environment. Please set it in your .env file.`,
      );
    }
  }

  const config: Config = {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL as string,
    VITE_SOCKET_URL: import.meta.env.VITE_SOCKET_URL as string,
    agent: {
      BLOCKED_ACCESS_CHECK_ENABLED:
        import.meta.env.VITE_AGENT_BLOCKED_ACCESS_CHECK_ENABLED === "true" ||
        import.meta.env.VITE_BLOCKED_ACCESS_CHECK_ENABLED === "true",
      KYC_VERIFICATION_CHECK_ENABLED:
        import.meta.env.VITE_AGENT_KYC_VERIFICATION_CHECK_ENABLED === "true" ||
        import.meta.env.VITE_KYC_VERIFICATION_CHECK_ENABLED === "true",
      ONBOARDING_STAGE_CHECK_ENABLED:
        import.meta.env.VITE_AGENT_ONBOARDING_STAGE_CHECK_ENABLED === "true" ||
        import.meta.env.VITE_ONBOARDING_STAGE_CHECK_ENABLED === "true",
    },
    farmer: {
      BLOCKED_ACCESS_CHECK_ENABLED:
        import.meta.env.VITE_FARMER_BLOCKED_ACCESS_CHECK_ENABLED === "true" ||
        import.meta.env.VITE_BLOCKED_ACCESS_CHECK_ENABLED === "true",
      KYC_VERIFICATION_CHECK_ENABLED:
        import.meta.env.VITE_FARMER_KYC_VERIFICATION_CHECK_ENABLED === "true" ||
        import.meta.env.VITE_KYC_VERIFICATION_CHECK_ENABLED === "true",
      ONBOARDING_STAGE_CHECK_ENABLED:
        import.meta.env.VITE_FARMER_ONBOARDING_STAGE_CHECK_ENABLED === "true" ||
        import.meta.env.VITE_ONBOARDING_STAGE_CHECK_ENABLED === "true",
    },
    buyer: {
      BLOCKED_ACCESS_CHECK_ENABLED:
        import.meta.env.VITE_BUYER_BLOCKED_ACCESS_CHECK_ENABLED === "true" ||
        import.meta.env.VITE_BLOCKED_ACCESS_CHECK_ENABLED === "true",
      KYC_VERIFICATION_CHECK_ENABLED:
        import.meta.env.VITE_BUYER_KYC_VERIFICATION_CHECK_ENABLED === "true" ||
        import.meta.env.VITE_KYC_VERIFICATION_CHECK_ENABLED === "true",
      ONBOARDING_STAGE_CHECK_ENABLED:
        import.meta.env.VITE_BUYER_ONBOARDING_STAGE_CHECK_ENABLED === "true" ||
        import.meta.env.VITE_ONBOARDING_STAGE_CHECK_ENABLED === "true",
    },
    BLOCKED_ACCESS_CHECK_ENABLED:
      import.meta.env.VITE_BLOCKED_ACCESS_CHECK_ENABLED === "true",
    KYC_VERIFICATION_CHECK_ENABLED:
      import.meta.env.VITE_KYC_VERIFICATION_CHECK_ENABLED === "true",
    ONBOARDING_STAGE_CHECK_ENABLED:
      import.meta.env.VITE_ONBOARDING_STAGE_CHECK_ENABLED === "true",
  };

  return config;
}

export const config = loadConfig();
