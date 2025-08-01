import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedAppChannelConfig } from "@/__tests__/mocks/app-config/mocked-app-config";
import { getMockedTransactionRecord } from "@/__tests__/mocks/app-transaction/mocked-transaction-record";
import { mockedAtobaraiApiClient } from "@/__tests__/mocks/atobarai/api/mocked-atobarai-api-client";
import { mockedAtobaraiTransactionId } from "@/__tests__/mocks/atobarai/mocked-atobarai-transaction-id";
import { mockedSourceObject } from "@/__tests__/mocks/saleor-events/mocked-source-object";
import { createAtobaraiCancelTransactionSuccessResponse } from "@/modules/atobarai/api/atobarai-cancel-transaction-success-response";
import {
  RefundFailureResult,
  RefundSuccessResult,
} from "@/modules/transaction-result/refund-result";

import { ParsedRefundEvent } from "../refund-event-parser";
import { TransactionRefundRequestedUseCaseResponse } from "../use-case-response";
import { BeforeFulfillmentRefundOrchestrator } from "./before-fulfillment-refund-orchestrator";

describe("BeforeFulfillmentRefundOrchestrator", () => {
  let orchestrator: BeforeFulfillmentRefundOrchestrator;

  const mockParsedEvent = {
    refundedAmount: 1000,
    sourceObjectTotalAmount: 2000,
    channelId: "channel-1",
    pspReference: mockedAtobaraiTransactionId,
    transactionToken: "saleor-transaction-token",
    issuedAt: "2023-01-01T00:00:00Z",
    sourceObject: mockedSourceObject,
    grantedRefund: null,
    currency: "JPY",
  } satisfies ParsedRefundEvent;

  beforeEach(() => {
    orchestrator = new BeforeFulfillmentRefundOrchestrator();
  });

  describe("processRefund", () => {
    const baseParams = {
      parsedEvent: mockParsedEvent,
      appConfig: mockedAppChannelConfig,
      atobaraiTransactionId: mockedAtobaraiTransactionId,
      apiClient: mockedAtobaraiApiClient,
    };

    const transactionRecordBeforeFulfillment = getMockedTransactionRecord({
      saleorTrackingNumber: null,
      fulfillmentMetadataShippingCompanyCode: null,
    });

    describe("when fulfillment has not been reported", () => {
      it("should execute noFulfillmentPartialRefundWithoutLineItemsStrategy for partial refund without line items if there is no grantedRefund", async () => {
        const refundedAmount = 1000;
        const sourceObjectTotalAmount = 2137;

        const partialRefundEvent = {
          ...mockParsedEvent,
          refundedAmount,
          sourceObjectTotalAmount,
          grantedRefund: null,
        };

        const changeTransactionSpy = vi
          .spyOn(mockedAtobaraiApiClient, "changeTransaction")
          .mockResolvedValueOnce(
            ok({
              results: [
                {
                  np_transaction_id: mockedAtobaraiTransactionId,
                  authori_result: "00",
                },
              ],
            }),
          );

        const result = await orchestrator.processRefund({
          ...baseParams,
          parsedEvent: partialRefundEvent,
          transactionRecord: transactionRecordBeforeFulfillment,
        });

        expect(changeTransactionSpy).toHaveBeenCalledWith(
          {
            transactions: [
              expect.objectContaining({
                billed_amount: sourceObjectTotalAmount - refundedAmount,
                goods: expect.arrayContaining([
                  expect.objectContaining({
                    goods_price: -(sourceObjectTotalAmount - refundedAmount), // negative amount send to Atobarai
                  }),
                ]),
              }),
            ],
          },
          {
            rejectMultipleResults: true,
          },
        );

        expect(result._unsafeUnwrap()).toBeInstanceOf(
          TransactionRefundRequestedUseCaseResponse.Success,
        );
      });

      it("should return failure when strategy execution fails", async () => {
        const partialRefundEvent = {
          ...mockParsedEvent,
          refundedAmount: 1000,
          sourceObjectTotalAmount: 2000,
          grantedRefund: null,
        };

        const apiError = new Error("API call failed");

        vi.spyOn(mockedAtobaraiApiClient, "changeTransaction").mockResolvedValueOnce(err(apiError));

        const result = await orchestrator.processRefund({
          ...baseParams,
          parsedEvent: partialRefundEvent,
          transactionRecord: transactionRecordBeforeFulfillment,
        });

        expect(result._unsafeUnwrap()).toBeInstanceOf(
          TransactionRefundRequestedUseCaseResponse.Failure,
        );
        expect(result._unsafeUnwrap().transactionResult).toBeInstanceOf(RefundFailureResult);
      });

      it("should execute noFulfillmentFullRefundStrategy for full refund", async () => {
        const fullRefundEvent = {
          ...mockParsedEvent,
          refundedAmount: 2000, // Same as total
          sourceObjectTotalAmount: 2000,
          grantedRefund: null,
        };

        const spy = vi.spyOn(mockedAtobaraiApiClient, "cancelTransaction").mockResolvedValueOnce(
          ok(
            createAtobaraiCancelTransactionSuccessResponse({
              results: [
                {
                  np_transaction_id: mockedAtobaraiTransactionId,
                },
              ],
            }),
          ),
        );

        const result = await orchestrator.processRefund({
          ...baseParams,
          parsedEvent: fullRefundEvent,
          transactionRecord: transactionRecordBeforeFulfillment,
        });

        expect(spy).toHaveBeenCalledWith(
          {
            transactions: [
              expect.objectContaining({
                np_transaction_id: mockedAtobaraiTransactionId,
              }),
            ],
          },
          {
            rejectMultipleResults: true,
          },
        );

        expect(result._unsafeUnwrap()).toBeInstanceOf(
          TransactionRefundRequestedUseCaseResponse.Success,
        );
        expect(result._unsafeUnwrap().transactionResult).toBeInstanceOf(RefundSuccessResult);
      });

      it("should execute noFulfillmentPartialRefundWithLineItemsStrategy for partial refund with line items", async () => {
        const refundedAmount = 1_445;
        const sourceObjectTotalAmount = 24_031;
        const partialRefundWithLineItemsEvent = {
          ...mockParsedEvent,
          refundedAmount,
          sourceObjectTotalAmount,
          grantedRefund: {
            lines: [
              {
                orderLine: {
                  id: mockedSourceObject.lines[0].id,
                },
                quantity: 1,
              },
            ],
            shippingCostsIncluded: false,
          },
        };

        const spy = vi.spyOn(mockedAtobaraiApiClient, "changeTransaction").mockResolvedValueOnce(
          ok({
            results: [
              {
                np_transaction_id: mockedAtobaraiTransactionId,
                authori_result: "00",
              },
            ],
          }),
        );

        const result = await orchestrator.processRefund({
          ...baseParams,
          parsedEvent: partialRefundWithLineItemsEvent,
          transactionRecord: transactionRecordBeforeFulfillment,
        });

        expect(spy).toHaveBeenCalledWith(
          {
            transactions: [
              expect.objectContaining({
                billed_amount: sourceObjectTotalAmount - refundedAmount,
                goods: [
                  {
                    goods_name: "product-sku",
                    goods_price: mockedSourceObject.lines[0].unitPrice.gross.amount,
                    quantity:
                      mockedSourceObject.lines[0].quantity -
                      partialRefundWithLineItemsEvent.grantedRefund.lines[0].quantity,
                  },
                  {
                    goods_name: "Voucher",
                    goods_price: mockedSourceObject.discount?.amount,
                    quantity: 1,
                  },
                  {
                    goods_name: "Shipping",
                    goods_price: mockedSourceObject.shippingPrice.gross.amount,
                    quantity: 1,
                  },
                ],
              }),
            ],
          },
          {
            rejectMultipleResults: true,
          },
        );

        expect(result._unsafeUnwrap()).toBeInstanceOf(
          TransactionRefundRequestedUseCaseResponse.Success,
        );
        expect(result._unsafeUnwrap().transactionResult).toBeInstanceOf(RefundSuccessResult);
      });
    });
  });
});
