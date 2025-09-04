import { type NextRequest, NextResponse } from "next/server"
import { dbOperations } from "@/lib/database"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Token não fornecido" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = verifyToken(token)

    if (!user || user.type !== "employee") {
      return NextResponse.json({ success: false, message: "Acesso negado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const type = searchParams.get("type") || "sales"

    if (!startDate || !endDate) {
      return NextResponse.json({ success: false, message: "Datas de início e fim são obrigatórias" }, { status: 400 })
    }

    console.log("📄 Gerando SAF-T Angola:", { startDate, endDate, type })

    const { data: saftData, error } = await dbOperations.generateSAFTData(startDate, endDate, type)

    if (error) {
      console.error("❌ Erro ao gerar SAF-T:", error)
      return NextResponse.json({ success: false, message: "Erro ao gerar SAF-T" }, { status: 500 })
    }

    // Gerar XML SAF-T Angola
    const saftXml = generateSAFTXML(saftData)

    console.log("✅ SAF-T gerado com sucesso")

    return new NextResponse(saftXml, {
      headers: {
        "Content-Type": "application/xml",
        "Content-Disposition": `attachment; filename="SAFT_AO_${startDate}_${endDate}.xml"`,
      },
    })
  } catch (error) {
    console.error("❌ Erro na geração de SAF-T:", error)
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 })
  }
}

function generateSAFTXML(data: any): string {
  const now = new Date().toISOString()

  return `<?xml version="1.0" encoding="UTF-8"?>
<AuditFile xmlns="urn:OECD:StandardAuditFile-Tax:AO_1.01_01">
  <Header>
    <AuditFileVersion>1.01_01</AuditFileVersion>
    <CompanyID>123456789</CompanyID>
    <TaxRegistrationNumber>123456789</TaxRegistrationNumber>
    <TaxAccountingBasis>F</TaxAccountingBasis>
    <CompanyName>Farmácia Olivesma</CompanyName>
    <BusinessName>Farmácia Olivesma</BusinessName>
    <CompanyAddress>
      <AddressDetail>Rua Principal, 123</AddressDetail>
      <City>Luanda</City>
      <PostalCode>0000</PostalCode>
      <Province>Luanda</Province>
      <Country>AO</Country>
    </CompanyAddress>
    <FiscalYear>2024</FiscalYear>
    <StartDate>${data.startDate}</StartDate>
    <EndDate>${data.endDate}</EndDate>
    <CurrencyCode>AOA</CurrencyCode>
    <DateCreated>${now.split("T")[0]}</DateCreated>
    <TimeCreated>${now.split("T")[1].split(".")[0]}</TimeCreated>
    <ProductCompanyTaxID>123456789</ProductCompanyTaxID>
    <SoftwareCertificateNumber>0</SoftwareCertificateNumber>
    <ProductID>Farmácia Olivesma System</ProductID>
    <ProductVersion>1.0</ProductVersion>
  </Header>
  
  <MasterFiles>
    <GeneralLedgerAccounts>
      ${
        data.accounts
          ?.map(
            (account: any) => `
      <Account>
        <AccountID>${account.id}</AccountID>
        <AccountDescription>${account.description}</AccountDescription>
        <StandardAccountID>${account.standard_id}</StandardAccountID>
        <AccountType>GL</AccountType>
        <AccountCreationDate>${data.startDate}</AccountCreationDate>
      </Account>`,
          )
          .join("") || ""
      }
    </GeneralLedgerAccounts>
    
    <Customers>
      ${
        data.customers
          ?.map(
            (customer: any) => `
      <Customer>
        <CustomerID>${customer.id}</CustomerID>
        <AccountID>211</AccountID>
        <CustomerTaxID>${customer.id}</CustomerTaxID>
        <CompanyName>${customer.first_name} ${customer.last_name}</CompanyName>
        <BillingAddress>
          <AddressDetail>${customer.address || "N/A"}</AddressDetail>
          <City>${customer.municipality || "Luanda"}</City>
          <PostalCode>0000</PostalCode>
          <Province>${customer.province || "Luanda"}</Province>
          <Country>AO</Country>
        </BillingAddress>
        <Telephone>${customer.phone || ""}</Telephone>
        <Email>${customer.email || ""}</Email>
        <SelfBillingIndicator>0</SelfBillingIndicator>
      </Customer>`,
          )
          .join("") || ""
      }
    </Customers>
    
    <Suppliers>
      ${
        data.suppliers
          ?.map(
            (supplier: any) => `
      <Supplier>
        <SupplierID>${supplier.id}</SupplierID>
        <AccountID>221</AccountID>
        <SupplierTaxID>${supplier.id}</SupplierTaxID>
        <CompanyName>${supplier.name}</CompanyName>
        <BillingAddress>
          <AddressDetail>${supplier.address || "N/A"}</AddressDetail>
          <City>Luanda</City>
          <PostalCode>0000</PostalCode>
          <Province>Luanda</Province>
          <Country>AO</Country>
        </BillingAddress>
        <SelfBillingIndicator>0</SelfBillingIndicator>
      </Supplier>`,
          )
          .join("") || ""
      }
    </Suppliers>
    
    <Products>
      ${
        data.products
          ?.map(
            (product: any) => `
      <Product>
        <ProductType>P</ProductType>
        <ProductCode>${product.code}</ProductCode>
        <ProductGroup>${product.category_name || "Medicamentos"}</ProductGroup>
        <ProductDescription>${product.name}</ProductDescription>
        <ProductNumberCode>${product.code}</ProductNumberCode>
      </Product>`,
          )
          .join("") || ""
      }
    </Products>
    
    <TaxTable>
      <TaxTableEntry>
        <TaxType>IVA</TaxType>
        <TaxCountryRegion>AO</TaxCountryRegion>
        <TaxCode>NOR</TaxCode>
        <Description>Taxa Normal</Description>
        <TaxPercentage>14.00</TaxPercentage>
      </TaxTableEntry>
    </TaxTable>
  </MasterFiles>
  
  <GeneralLedgerEntries>
    <NumberOfEntries>${data.sales?.length || 0}</NumberOfEntries>
    <TotalDebit>${data.totalSales || 0}</TotalDebit>
    <TotalCredit>${data.totalSales || 0}</TotalCredit>
    ${
      data.sales
        ?.map(
          (sale: any, index: number) => `
    <Journal>
      <JournalID>VEN</JournalID>
      <Description>Vendas</Description>
      <Transaction>
        <TransactionID>${sale.sale_number}</TransactionID>
        <Period>${new Date(sale.created_at).getMonth() + 1}</Period>
        <TransactionDate>${sale.created_at.split("T")[0]}</TransactionDate>
        <SourceID>POS</SourceID>
        <Description>Venda ${sale.sale_number}</Description>
        <DocArchivalNumber>${sale.sale_number}</DocArchivalNumber>
        <TransactionType>N</TransactionType>
        <GLPostingDate>${sale.created_at.split("T")[0]}</GLPostingDate>
        <CustomerID>${sale.customer_id || "CONSUMIDOR_FINAL"}</CustomerID>
        <Lines>
          <DebitLine>
            <RecordID>1</RecordID>
            <AccountID>11</AccountID>
            <SourceDocumentID>${sale.sale_number}</SourceDocumentID>
            <SystemEntryDate>${sale.created_at.split("T")[0]}</SystemEntryDate>
            <Description>Venda ${sale.sale_number}</Description>
            <DebitAmount>${sale.total_amount}</DebitAmount>
          </DebitLine>
          <CreditLine>
            <RecordID>2</RecordID>
            <AccountID>71</AccountID>
            <SourceDocumentID>${sale.sale_number}</SourceDocumentID>
            <SystemEntryDate>${sale.created_at.split("T")[0]}</SystemEntryDate>
            <Description>Venda ${sale.sale_number}</Description>
            <CreditAmount>${sale.total_amount}</CreditAmount>
          </CreditLine>
        </Lines>
      </Transaction>
    </Journal>`,
        )
        .join("") || ""
    }
  </GeneralLedgerEntries>
  
  <SourceDocuments>
    <SalesInvoices>
      <NumberOfEntries>${data.sales?.length || 0}</NumberOfEntries>
      <TotalDebit>0.00</TotalDebit>
      <TotalCredit>${data.totalSales || 0}</TotalCredit>
      ${
        data.sales
          ?.map(
            (sale: any) => `
      <Invoice>
        <InvoiceNo>${sale.sale_number}</InvoiceNo>
        <DocumentStatus>
          <InvoiceStatus>N</InvoiceStatus>
          <InvoiceStatusDate>${sale.created_at.split("T")[0]}</InvoiceStatusDate>
          <SourceID>POS</SourceID>
          <SourceBilling>P</SourceBilling>
        </DocumentStatus>
        <Hash>0</Hash>
        <HashControl>1</HashControl>
        <Period>${new Date(sale.created_at).getMonth() + 1}</Period>
        <InvoiceDate>${sale.created_at.split("T")[0]}</InvoiceDate>
        <InvoiceType>FT</InvoiceType>
        <SpecialRegimes>
          <SelfBillingIndicator>0</SelfBillingIndicator>
          <CashVATSchemeIndicator>0</CashVATSchemeIndicator>
          <ThirdPartiesBillingIndicator>0</ThirdPartiesBillingIndicator>
        </SpecialRegimes>
        <SourceID>POS</SourceID>
        <SystemEntryDate>${sale.created_at}</SystemEntryDate>
        <CustomerID>${sale.customer_id || "CONSUMIDOR_FINAL"}</CustomerID>
        ${
          sale.items
            ?.map(
              (item: any, lineIndex: number) => `
        <Line>
          <LineNumber>${lineIndex + 1}</LineNumber>
          <ProductCode>${item.product_code}</ProductCode>
          <ProductDescription>${item.product_name}</ProductDescription>
          <Quantity>${item.quantity}</Quantity>
          <UnitOfMeasure>UN</UnitOfMeasure>
          <UnitPrice>${item.unit_price}</UnitPrice>
          <TaxPointDate>${sale.created_at.split("T")[0]}</TaxPointDate>
          <Description>${item.product_name}</Description>
          <CreditAmount>${item.total_price}</CreditAmount>
          <Tax>
            <TaxType>IVA</TaxType>
            <TaxCountryRegion>AO</TaxCountryRegion>
            <TaxCode>NOR</TaxCode>
            <TaxPercentage>14.00</TaxPercentage>
            <TaxAmount>${item.iva_amount || item.total_price * 0.14}</TaxAmount>
          </Tax>
          <SettlementAmount>0.00</SettlementAmount>
        </Line>`,
            )
            .join("") || ""
        }
        <DocumentTotals>
          <TaxPayable>${sale.iva_amount}</TaxPayable>
          <NetTotal>${sale.subtotal}</NetTotal>
          <GrossTotal>${sale.total_amount}</GrossTotal>
          <Currency>
            <CurrencyCode>AOA</CurrencyCode>
            <CurrencyAmount>${sale.total_amount}</CurrencyAmount>
          </Currency>
        </DocumentTotals>
      </Invoice>`,
          )
          .join("") || ""
      }
    </SalesInvoices>
    
    <Payments>
      <NumberOfEntries>${data.payments?.length || 0}</NumberOfEntries>
      <TotalDebit>${data.totalPayments || 0}</TotalDebit>
      <TotalCredit>0.00</TotalCredit>
      ${
        data.payments
          ?.map(
            (payment: any) => `
      <Payment>
        <PaymentRefNo>${payment.reference}</PaymentRefNo>
        <Period>${new Date(payment.created_at).getMonth() + 1}</Period>
        <TransactionDate>${payment.created_at.split("T")[0]}</TransactionDate>
        <PaymentType>RG</PaymentType>
        <Description>Pagamento ${payment.reference}</Description>
        <SystemID>POS</SystemID>
        <DocumentStatus>
          <PaymentStatus>N</PaymentStatus>
          <PaymentStatusDate>${payment.created_at.split("T")[0]}</PaymentStatusDate>
          <SourceID>POS</SourceID>
          <SourcePayment>P</SourcePayment>
        </DocumentStatus>
        <PaymentMethod>
          <PaymentMechanism>${payment.method === "cash" ? "NU" : "TB"}</PaymentMechanism>
          <PaymentAmount>${payment.amount}</PaymentAmount>
          <PaymentDate>${payment.created_at.split("T")[0]}</PaymentDate>
        </PaymentMethod>
        <SourceID>POS</SourceID>
        <SystemEntryDate>${payment.created_at}</SystemEntryDate>
        <CustomerID>${payment.customer_id || "CONSUMIDOR_FINAL"}</CustomerID>
        <Line>
          <LineNumber>1</LineNumber>
          <SourceDocumentID>${payment.reference}</SourceDocumentID>
          <DebitAmount>${payment.amount}</DebitAmount>
        </Line>
        <DocumentTotals>
          <TaxPayable>0.00</TaxPayable>
          <NetTotal>${payment.amount}</NetTotal>
          <GrossTotal>${payment.amount}</GrossTotal>
        </DocumentTotals>
      </Payment>`,
          )
          .join("") || ""
      }
    </Payments>
  </SourceDocuments>
</AuditFile>`
}
