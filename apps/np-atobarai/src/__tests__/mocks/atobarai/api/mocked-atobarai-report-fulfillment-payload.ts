import { createAtobaraiFulfillmentReportPayload } from "@/modules/atobarai/api/atobarai-fulfillment-report-payload";

import { mockedAtobaraiShippingCompanyCode } from "../mocked-atobarai-shipping-company-code";
import { mockedAtobaraiTransactionId } from "../mocked-atobarai-transaction-id";

export const mockedAtobaraiFulfillmentReportPayload = createAtobaraiFulfillmentReportPayload({
  trackingNumber: "1234567890",
  shippingCompanyCode: mockedAtobaraiShippingCompanyCode,
  atobaraiTransactionId: mockedAtobaraiTransactionId,
});
