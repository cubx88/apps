import { BaseError } from "@saleor/errors";
import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config/mocked-app-config-repo";
import { mockedAtobaraiApiClient } from "@/__tests__/mocks/atobarai/api/mocked-atobarai-api-client";
import { mockedGraphqlClient } from "@/__tests__/mocks/graphql-client";
import { mockAuthData } from "@/__tests__/mocks/saleor/mocked-auth-data";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor/mocked-saleor-api-url";
import { mockedSaleorAppId } from "@/__tests__/mocks/saleor/mocked-saleor-app-id";
import { TEST_Procedure } from "@/__tests__/trpc-testing-procedure";
import { NewConfigTrpcHandler } from "@/modules/app-config/trpc-handlers/new-config-trpc-handler";
import { AtobaraiApiClientValidationError } from "@/modules/atobarai/api/types";
import { router } from "@/modules/trpc/trpc-server";

/**
 * TODO: Probably create some test abstraction to bootstrap trpc handler for testing
 */
const getTestCaller = () => {
  const instance = new NewConfigTrpcHandler({
    atobaraiClientFactory: {
      create() {
        return mockedAtobaraiApiClient;
      },
    },
  });

  // @ts-expect-error - context doesnt match but its applied in test
  instance.baseProcedure = TEST_Procedure;

  const testRouter = router({
    testProcedure: instance.getTrpcProcedure(),
  });

  return {
    mockedAtobaraiApiClient,
    mockedAppConfigRepo,
    caller: testRouter.createCaller({
      appId: mockedSaleorAppId,
      saleorApiUrl: mockedSaleorApiUrl,
      token: mockAuthData.token,
      configRepo: mockedAppConfigRepo,
      apiClient: mockedGraphqlClient,
      appUrl: "https://localhost:3000",
    }),
  };
};

describe("NewConfigTrpcHandler", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("Returns error 500 if repository fails to save config", async () => {
    const { caller, mockedAppConfigRepo, mockedAtobaraiApiClient } = getTestCaller();

    mockedAtobaraiApiClient.verifyCredentials.mockImplementationOnce(async () => ok(null));

    vi.spyOn(mockedAppConfigRepo, "saveChannelConfig").mockImplementationOnce(async () =>
      err(new BaseError("TEST")),
    );

    return expect(() =>
      caller.testProcedure({
        name: "Test config",
        skuAsName: true,
        shippingCompanyCode: "55555",
        merchantCode: "aaa",
        secretSpCode: "bbb",
        terminalId: "ccc",
        useSandbox: true,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Failed to create configuration. Data can't be saved.]`,
    );
  });

  it("Returns 404 if config is in invalid shape (model can't be created)", () => {
    const { caller, mockedAppConfigRepo, mockedAtobaraiApiClient } = getTestCaller();

    mockedAtobaraiApiClient.verifyCredentials.mockImplementationOnce(async () => ok(null));
    vi.spyOn(mockedAppConfigRepo, "saveChannelConfig").mockImplementationOnce(async () => ok(null));

    // todo expect pretty zod error with zod-validation-error
    return expect(
      caller.testProcedure({
        name: "",
        skuAsName: true,
        shippingCompanyCode: "55555",
        merchantCode: "aaa",
        secretSpCode: "bbb",
        terminalId: "ccc",
        useSandbox: true,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [TRPCError: [
        {
          "code": "too_small",
          "minimum": 1,
          "type": "string",
          "inclusive": true,
          "exact": false,
          "message": "String must contain at least 1 character(s)",
          "path": [
            "name"
          ]
        }
      ]]
    `);
  });

  it("Doesn't throw if everything set properly. Config repo is called to save data", async () => {
    const { caller, mockedAppConfigRepo, mockedAtobaraiApiClient } = getTestCaller();

    mockedAtobaraiApiClient.verifyCredentials.mockImplementationOnce(async () => ok(null));
    vi.spyOn(mockedAppConfigRepo, "saveChannelConfig").mockImplementationOnce(async () => ok(null));

    await expect(
      caller.testProcedure({
        name: "test",
        skuAsName: true,
        shippingCompanyCode: "55555",
        merchantCode: "aaa",
        secretSpCode: "bbb",
        terminalId: "ccc",
        useSandbox: true,
      }),
    ).resolves.not.toThrow();

    const mockCallArg = vi.mocked(mockedAppConfigRepo.saveChannelConfig).mock.calls[0][0];

    expect(mockCallArg).toMatchInlineSnapshot(
      {
        config: {
          id: expect.any(String),
        },
      },
      `
      {
        "appId": "mocked-saleor-app-id",
        "config": {
          "id": Any<String>,
          "merchantCode": "aaa",
          "name": "test",
          "secretSpCode": "bbb",
          "shippingCompanyCode": "55555",
          "skuAsName": true,
          "terminalId": "ccc",
          "useSandbox": true,
        },
        "saleorApiUrl": "https://mocked.saleor.api/graphql/",
      }
    `,
    );
  });

  describe("Auth", () => {
    it("Calls auth service and returns error if credentials are not valid", () => {
      const { caller, mockedAtobaraiApiClient } = getTestCaller();

      mockedAtobaraiApiClient.verifyCredentials.mockImplementationOnce(() =>
        err(new AtobaraiApiClientValidationError("Failed to verify credentials")),
      );

      return expect(() =>
        caller.testProcedure({
          name: "test",
          skuAsName: true,
          shippingCompanyCode: "55555",
          merchantCode: "aaa",
          secretSpCode: "bbb",
          terminalId: "ccc",
          useSandbox: true,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: Provided Atobarai credentials are invalid. Please check your SP Code, Merchant Code, and Terminal ID.]`,
      );
    });
  });
});
