using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using WebAPI.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace WebAPI.Data
{
    public class SeedData
    {
        public static void Initialize(InvoicikaDbContext context, ILogger<SeedData> logger)
        {
            context.Database.EnsureCreated();

            try
            {
                if (!context.Roles.Any())
                {
                    var adminRole = new Role
                    {
                        RoleId = Guid.NewGuid(),
                        RoleName = "Admin",
                        CreationDate = DateTime.UtcNow
                    };

                    var employeeRole = new Role
                    {
                        RoleId = Guid.NewGuid(),
                        RoleName = "Employee",
                        CreationDate = DateTime.UtcNow
                    };

                    context.Roles.AddRange(adminRole, employeeRole);
                    logger.LogInformation("Roles added to the database.");

                    var users = new List<User>
                    {
                        new User
                        {
                            Username = "admin1",
                            EmailAddress = "admin1@example.com",
                            PasswordHash = HashPassword("admin1"),
                            PhotoUrl = "/uploads/admin1.png",
                            Role_id = adminRole.RoleId,
                            CreationDate = DateTime.UtcNow
                        },
                        new User
                        {
                            Username = "admin2",
                            EmailAddress = "admin2@example.com",
                            PasswordHash = HashPassword("admin2"),
                            PhotoUrl = "/uploads/admin2.png",
                            Role_id = adminRole.RoleId,
                            CreationDate = DateTime.UtcNow
                        },
                        new User
                        {
                            Username = "employee1",
                            EmailAddress = "employee1@example.com",
                            PasswordHash = HashPassword("employee1"),
                            PhotoUrl = "/uploads/employee1.jpg",
                            Role_id = employeeRole.RoleId,
                            CreationDate = DateTime.UtcNow
                        },
                        new User
                        {
                            Username = "employee2",
                            EmailAddress = "employee2@example.com",
                            PasswordHash = HashPassword("employee2"),
                            Role_id = employeeRole.RoleId,
                            CreationDate = DateTime.UtcNow
                        }
                    };

                    context.Users.AddRange(users);
                    logger.LogInformation("Users added to the database.");

                    // Define real items for a wedding management service company
                    var realItems = new List<(string Name, string Description, decimal PurchasePrice, decimal SalePrice)>
                    {
                        ("Bridal Gown", "Elegant bridal gown with lace details", 800.00m, 1200.00m),
                        ("Groom's Tuxedo", "Classic black tuxedo with bow tie", 400.00m, 600.00m),
                        ("Wedding Cake", "Three-tier vanilla cake with fondant decoration", 250.00m, 300.00m),
                        ("Floral Arrangements", "Bouquets and centerpieces for the ceremony", 500.00m, 700.00m),
                        ("Table Settings", "Complete set including plates, cutlery, and glassware", 200.00m, 250.00m),
                        ("Chairs and Linens", "Chairs with white linens and sashes", 150.00m, 200.00m),
                        ("Lighting Setup", "LED uplighting and fairy lights for ambiance", 300.00m, 400.00m),
                        ("Sound System", "PA system with microphones and speakers", 400.00m, 500.00m),
                        ("DJ Service", "Professional DJ with music selection and equipment", 600.00m, 800.00m),
                        ("Photo Booth", "Includes props and unlimited prints", 350.00m, 450.00m),
                        ("Photography Package", "Full-day coverage with edited photos", 1000.00m, 1200.00m),
                        ("Videography Package", "Full-day coverage with edited video", 1200.00m, 1500.00m),
                        ("Wedding Planner", "Professional planning services and coordination", 1500.00m, 2000.00m),
                        ("Reception Decor", "Decorations including banners and table runners", 250.00m, 350.00m),
                        ("Ceremony Arch", "Decorated arch for the wedding ceremony", 300.00m, 400.00m),
                        ("Dance Floor", "Portable dance floor for the reception", 500.00m, 600.00m),
                        ("Wedding Invitations", "Custom designed and printed invitations", 150.00m, 200.00m),
                        ("Bridesmaid Dresses", "Matching dresses for the bridal party", 200.00m, 300.00m),
                        ("Groom's Men Suits", "Suits for the groomsmen with matching accessories", 300.00m, 400.00m),
                        ("Cake Cutting Service", "Includes the cutting and serving of the cake", 100.00m, 150.00m),
                        ("Guest Book", "Custom guest book for signatures and messages", 50.00m, 75.00m),
                        ("Transportation Service", "Luxury transportation for the bride and groom", 500.00m, 700.00m),
                        ("Champagne Toast", "Champagne service for the toast", 200.00m, 250.00m),
                        ("Catering Service", "Full catering for the wedding reception", 2000.00m, 2500.00m),
                        ("Wedding Favors", "Small gifts for guests as a thank you", 100.00m, 150.00m)
                    };

                    var items = new List<Item>();

                    foreach (var (Name, Description, PurchasePrice, SalePrice) in realItems)
                    {
                        items.Add(new Item
                        {
                            Name = Name,
                            Description = Description,
                            PurchasePrice = PurchasePrice,
                            SalePrice = SalePrice,
                            Quantity = new Random().Next(1, 100), // Random quantity between 1 and 100
                            User_id = users[0].UserId, // Example user
                            CreationDate = DateTime.UtcNow
                        });
                    }

                    context.Items.AddRange(items);
                    logger.LogInformation("Wedding management service items added to the database.");

                    // Add Customers
                    var customers = new List<Customer>
                    {
                        new Customer
                        {
                            Name = "Jenna Jameson",
                            Address = "1234 Elm St, Austin, TX 73301",
                            PhoneNumber = "512-555-1234",
                            Email = "jenna.jameson@example.com",
                            CreationDate = DateTime.UtcNow,
                            UpdateDate = DateTime.UtcNow
                        },
                        new Customer
                        {
                            Name = "Sasha Grey",
                            Address = "5678 Oak Dr, Phoenix, AZ 85001",
                            PhoneNumber = "602-555-5678",
                            Email = "sasha.grey@example.com",
                            CreationDate = DateTime.UtcNow,
                            UpdateDate = DateTime.UtcNow
                        },
                        new Customer
                        {
                            Name = "Max Müller",
                            Address = "Kaiserstraße 1, 10115 Berlin, Germany",
                            PhoneNumber = "+49 30 12345678",
                            Email = "max.mueller@example.com",
                            CreationDate = DateTime.UtcNow,
                            UpdateDate = DateTime.UtcNow
                        },
                        new Customer
                        {
                            Name = "Lukas Schmidt",
                            Address = "Schillerstraße 20, 80336 München, Germany",
                            PhoneNumber = "+49 89 23456789",
                            Email = "lukas.schmidt@example.com",
                            CreationDate = DateTime.UtcNow,
                            UpdateDate = DateTime.UtcNow
                        },
                        new Customer
                        {
                            Name = "Riley Reid",
                            Address = "9101 Maple Ave, Denver, CO 80201",
                            PhoneNumber = "303-555-9101",
                            Email = "riley.reid@example.com",
                            CreationDate = DateTime.UtcNow,
                            UpdateDate = DateTime.UtcNow
                        },
                        new Customer
                        {
                            Name = "Mia Martinez",
                            Address = "2345 Pine St, Las Vegas, NV 89101",
                            PhoneNumber = "702-555-2345",
                            Email = "mia.martinez@example.com",
                            CreationDate = DateTime.UtcNow,
                            UpdateDate = DateTime.UtcNow
                        },
                        new Customer
                        {
                            Name = "Felix Braun",
                            Address = "Hauptstraße 42, 20457 Hamburg, Germany",
                            PhoneNumber = "+49 40 34567890",
                            Email = "felix.braun@example.com",
                            CreationDate = DateTime.UtcNow,
                            UpdateDate = DateTime.UtcNow
                        },
                        new Customer
                        {
                            Name = "Julian Weber",
                            Address = "Friedrichstraße 77, 04109 Leipzig, Germany",
                            PhoneNumber = "+49 341 45678901",
                            Email = "julian.weber@example.com",
                            CreationDate = DateTime.UtcNow,
                            UpdateDate = DateTime.UtcNow
                        },
                        new Customer
                        {
                            Name = "Abella Danger",
                            Address = "6789 Cedar Ln, Seattle, WA 98101",
                            PhoneNumber = "206-555-6789",
                            Email = "abella.danger@example.com",
                            CreationDate = DateTime.UtcNow,
                            UpdateDate = DateTime.UtcNow
                        },
                        new Customer
                        {
                            Name = "Jordana James",
                            Address = "3456 Birch Rd, Orlando, FL 32801",
                            PhoneNumber = "407-555-3456",
                            Email = "jordana.james@example.com",
                            CreationDate = DateTime.UtcNow,
                            UpdateDate = DateTime.UtcNow
                        },
                        new Customer
                        {
                            Name = "Paul Schneider",
                            Address = "Berliner Allee 10, 40468 Düsseldorf, Germany",
                            PhoneNumber = "+49 211 56789012",
                            Email = "paul.schneider@example.com",
                            CreationDate = DateTime.UtcNow,
                            UpdateDate = DateTime.UtcNow
                        },
                    };

                    context.Customers.AddRange(customers);
                    logger.LogInformation("Customers added to the database.");
                    var vats = new List<VAT>
                    {
                        new VAT
                        {
                            VatId = Guid.NewGuid(),
                            Percentage = 0.00m,
                            CreationDate = DateTime.UtcNow
                        },
                        new VAT
                        {
                            VatId = Guid.NewGuid(),
                            Percentage = 5.00m,
                            CreationDate = DateTime.UtcNow
                        },
                        new VAT
                        {
                            VatId = Guid.NewGuid(),
                            Percentage = 10.00m,
                            CreationDate = DateTime.UtcNow
                        }
                    };

                    // Add VAT entries to the context
                    context.VATs.AddRange(vats);
                    logger.LogInformation("VAT entries added to the database.");


                    // Save changes
                    context.SaveChanges();
                    logger.LogInformation("Database seeding completed.");
                }
                else
                {
                    logger.LogInformation("Roles already exist, skipping role seeding.");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while seeding the database.");
            }
        }

        private static string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(bytes);
            }
        }
    }
}
