USE DmsDb;
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DailyActivities')
BEGIN
    CREATE TABLE DailyActivities (
        ActivityId INT IDENTITY(1,1) PRIMARY KEY,
        Title NVARCHAR(200) NOT NULL,
        Description NVARCHAR(MAX),
        ActivityDate DATETIME2 NOT NULL,
        CreatedBy NVARCHAR(100)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DailyExpenses')
BEGIN
    CREATE TABLE DailyExpenses (
        ExpenseId INT IDENTITY(1,1) PRIMARY KEY,
        ExpenseTitle NVARCHAR(200) NOT NULL,
        Category NVARCHAR(100) NOT NULL,
        Amount DECIMAL(18,2) NOT NULL,
        ExpenseDate DATETIME2 NOT NULL,
        Notes NVARCHAR(MAX)
    );
END
GO
