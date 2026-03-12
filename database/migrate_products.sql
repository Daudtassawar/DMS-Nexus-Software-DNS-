-- Run this script to add new columns to the Products table
-- Execute via: Get-Content migrate_products.sql | docker exec -i dms-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "Your_Super_Strong_Password_123!" -C

USE [DmsDb];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- Add MinStockLevel column if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Products' AND COLUMN_NAME = 'MinStockLevel')
BEGIN
    ALTER TABLE Products ADD MinStockLevel INT NOT NULL DEFAULT 0;
    PRINT 'Added MinStockLevel column';
END
ELSE
    PRINT 'MinStockLevel already exists';
GO

-- Add ImagePath column if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Products' AND COLUMN_NAME = 'ImagePath')
BEGIN
    ALTER TABLE Products ADD ImagePath NVARCHAR(500) NULL;
    PRINT 'Added ImagePath column';
END
ELSE
    PRINT 'ImagePath already exists';
GO

-- Add ExpiryDate column if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Products' AND COLUMN_NAME = 'ExpiryDate')
BEGIN
    ALTER TABLE Products ADD ExpiryDate DATETIME2 NULL;
    PRINT 'Added ExpiryDate column';
END
ELSE
    PRINT 'ExpiryDate already exists';
GO

PRINT 'Migration complete!';
GO
