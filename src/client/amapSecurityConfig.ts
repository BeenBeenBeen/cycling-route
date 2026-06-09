type AmapSecurityTarget = {
  _AMapSecurityConfig?: {
    securityJsCode: string;
  };
};

export const configureAmapSecurity = (
  securityJsCode: string | undefined,
  target: AmapSecurityTarget = globalThis as AmapSecurityTarget,
) => {
  const normalized = securityJsCode?.trim();
  if (!normalized) {
    return;
  }

  target._AMapSecurityConfig = {
    securityJsCode: normalized,
  };
};
