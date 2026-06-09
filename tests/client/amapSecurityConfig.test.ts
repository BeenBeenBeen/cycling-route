import { describe, expect, it } from "vitest";
import { configureAmapSecurity } from "../../src/client/amapSecurityConfig";

describe("configureAmapSecurity", () => {
  it("sets the amap security js code before the map loader runs", () => {
    const target: { _AMapSecurityConfig?: { securityJsCode: string } } = {};

    configureAmapSecurity("security-code", target);

    expect(target._AMapSecurityConfig).toEqual({
      securityJsCode: "security-code",
    });
  });

  it("does not create amap security config for blank values", () => {
    const target: { _AMapSecurityConfig?: { securityJsCode: string } } = {};

    configureAmapSecurity("  ", target);

    expect(target._AMapSecurityConfig).toBeUndefined();
  });
});
