using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.VisualBasic.ApplicationServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Mvc;
using TheatreCMS3.Models;

namespace TheatreCMS3.Areas.Rent.Models
{
    // This history manager will act as an admin for the RentalHistory area and is responsible for keeping track of the history of returned rentals.
    //by inheriting from ApplicationUser : IdentityUser
    public class HistoryManager : ApplicationUser
    {
        //The RestrictedUsers property represents the number of Users that this manager has blocked from renting from the theatre again.
        //The RentalReplacementRequests represent the number of Rentals that need to be replaced due to damage.
        public int? RestrictedUsers { get; set; }
        public int? RentalReplacementRequests { get; set; }
        //public Role MyRole { get; set; }



        //should only be run only once, at app start
        public static void Seed(ApplicationDbContext context)
        {
            var roleManager = new RoleManager<IdentityRole>(new RoleStore<IdentityRole>(context));
            var roleUserManager = new UserManager<ApplicationUser>(new UserStore<ApplicationUser>(context));

            string roleName = "HistoryManager";

            if (true)//!roleManager.RoleExists(roleName))
            {
                //CREATE ROLE - this works
                var myIdentityRole = new IdentityRole();
                myIdentityRole.Name = roleName;
                roleManager.Create(myIdentityRole);


                //CREATE USER - works
                var MySeededHistoryManager = new HistoryManager
                {
                    //  from ApplicationUser parent properties:
                    //UserName Can't have spaces //Regex.Replace(roleName, @"\s", "")
                    UserName = roleName, 
                    Email = "historyManager@gmail.com",
                    RestrictedUsers = 1,
                    RentalReplacementRequests = 1
                };

                string password = "password";

                var myUser = roleUserManager.Create(MySeededHistoryManager, password);
                if (myUser.Succeeded)
                {
                    roleUserManager.AddToRole(MySeededHistoryManager.Id, roleName);
                }
            }
        }//end seed()
    }// end class
}//end namespace


//Migration command:

//Package Manager Console > Add-Migration IdentityDBUser
//Visual Studio Code Terminal > dotnet ef migration add IdentityDBUser
//Update Database command:

//Package Manager Console > Update-Database
//Visual Studio Code Terminal > dotnet ef database update


// an example off adding using context
//    var students = new List<Student>{};
//    students.ForEach(s => context.Students.Add(s));
// context.SaveChanges();




//FROM SITE

