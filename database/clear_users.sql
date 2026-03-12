USE [DmsDb];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- Delete user roles first due to foreign key constraints
DELETE FROM [AspNetUserRoles];
GO

-- Delete users
DELETE FROM [AspNetUsers];
GO

-- We leave AspNetRoles intact.
