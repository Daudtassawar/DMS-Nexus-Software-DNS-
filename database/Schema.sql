CREATE DATABASE DMS;
GO
USE DMS;
GO

-- 1. Distributors
CREATE TABLE Distributors (
    DistributorID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Region NVARCHAR(100) NULL,
    Contact NVARCHAR(50) NULL
);

-- 2. Salesmen
CREATE TABLE Salesmen (
    SalesmanID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Phone NVARCHAR(20) NOT NULL,
    Area NVARCHAR(100) NULL,
    CommissionRate DECIMAL(5,2) NOT NULL DEFAULT 0.00
);

-- 3. Customers
CREATE TABLE Customers (
    CustomerID INT IDENTITY(1,1) PRIMARY KEY,
    CustomerName NVARCHAR(100) NOT NULL,
    Phone NVARCHAR(20) NOT NULL,
    Address NVARCHAR(255) NULL,
    Area NVARCHAR(100) NULL,
    CreditLimit DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    Balance DECIMAL(18,2) NOT NULL DEFAULT 0.00
);
CREATE NONCLUSTERED INDEX IX_Customers_Phone ON Customers(Phone);

-- 4. Products
CREATE TABLE Products (
    ProductID INT IDENTITY(1,1) PRIMARY KEY,
    ProductName NVARCHAR(150) NOT NULL,
    Brand NVARCHAR(100) NULL,
    Category NVARCHAR(100) NULL,
    Barcode NVARCHAR(50) NULL,
    PurchasePrice DECIMAL(18,2) NOT NULL,
    SalePrice DECIMAL(18,2) NOT NULL,
    Unit NVARCHAR(20) NOT NULL,
    CreatedDate DATETIME2 NOT NULL DEFAULT GETDATE()
);
CREATE UNIQUE NONCLUSTERED INDEX IX_Products_Barcode ON Products(Barcode) WHERE Barcode IS NOT NULL;

-- 5. Stock
CREATE TABLE Stock (
    StockID INT IDENTITY(1,1) PRIMARY KEY,
    ProductID INT NOT NULL,
    Quantity INT NOT NULL DEFAULT 0,
    WarehouseLocation NVARCHAR(100) NULL,
    LastUpdated DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Stock_Products FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);
CREATE NONCLUSTERED INDEX IX_Stock_ProductID ON Stock(ProductID);

-- 6. Invoices
CREATE TABLE Invoices (
    InvoiceID INT IDENTITY(1,1) PRIMARY KEY,
    InvoiceNumber NVARCHAR(50) NOT NULL,
    CustomerID INT NOT NULL,
    SalesmanID INT NOT NULL,
    InvoiceDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    TotalAmount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    Discount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    NetAmount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    PaymentStatus NVARCHAR(20) NOT NULL DEFAULT 'Pending', -- Pending, Partial, Paid
    CONSTRAINT FK_Invoices_Customers FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
    CONSTRAINT FK_Invoices_Salesmen FOREIGN KEY (SalesmanID) REFERENCES Salesmen(SalesmanID)
);
CREATE UNIQUE NONCLUSTERED INDEX IX_Invoices_InvoiceNumber ON Invoices(InvoiceNumber);
CREATE NONCLUSTERED INDEX IX_Invoices_CustomerID ON Invoices(CustomerID);
CREATE NONCLUSTERED INDEX IX_Invoices_SalesmanID ON Invoices(SalesmanID);
CREATE NONCLUSTERED INDEX IX_Invoices_InvoiceDate ON Invoices(InvoiceDate);

-- 7. InvoiceItems
CREATE TABLE InvoiceItems (
    InvoiceItemID INT IDENTITY(1,1) PRIMARY KEY,
    InvoiceID INT NOT NULL,
    ProductID INT NOT NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    TotalPrice DECIMAL(18,2) NOT NULL,
    CONSTRAINT FK_InvoiceItems_Invoices FOREIGN KEY (InvoiceID) REFERENCES Invoices(InvoiceID),
    CONSTRAINT FK_InvoiceItems_Products FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);
CREATE NONCLUSTERED INDEX IX_InvoiceItems_InvoiceID ON InvoiceItems(InvoiceID);
CREATE NONCLUSTERED INDEX IX_InvoiceItems_ProductID ON InvoiceItems(ProductID);

-- 8. StockTransactions
CREATE TABLE StockTransactions (
    TransactionID INT IDENTITY(1,1) PRIMARY KEY,
    ProductID INT NOT NULL,
    TransactionType NVARCHAR(20) NOT NULL, -- In, Out, Return
    Quantity INT NOT NULL,
    Date DATETIME2 NOT NULL DEFAULT GETDATE(),
    ReferenceID INT NULL,
    CONSTRAINT FK_StockTransactions_Products FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);
CREATE NONCLUSTERED INDEX IX_StockTransactions_ProductID ON StockTransactions(ProductID);
CREATE NONCLUSTERED INDEX IX_StockTransactions_Date ON StockTransactions(Date);

-- 9. Payments
CREATE TABLE Payments (
    PaymentID INT IDENTITY(1,1) PRIMARY KEY,
    InvoiceID INT NOT NULL,
    AmountPaid DECIMAL(18,2) NOT NULL,
    PaymentDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    PaymentMethod NVARCHAR(50) NOT NULL,
    CONSTRAINT FK_Payments_Invoices FOREIGN KEY (InvoiceID) REFERENCES Invoices(InvoiceID)
);
CREATE NONCLUSTERED INDEX IX_Payments_InvoiceID ON Payments(InvoiceID);
