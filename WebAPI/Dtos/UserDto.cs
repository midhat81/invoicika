namespace WebAPI.Dtos
{
    public class UserDto
    {
        public Guid UserId { get; set; }
        public string Username { get; set; }
        public string EmailAddress { get; set; }
        public string? PhotoUrl { get; set; }
        public string? PasswordHash { get; set; }  // In a real application, avoid exposing password hashes in DTOs
        public Guid Role_id { get; set; }
        public string? RoleName { get; set; }
        public DateTime? CreationDate { get; set; }
        public DateTime? UpdateDate { get; set; }
    }
}
