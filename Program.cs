using Microsoft.EntityFrameworkCore;
using VenhanProject.Model;

var builder = WebApplication.CreateBuilder(args);

// ? Database Connection
builder.Services.AddDbContext<LibraryContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ? Add Controllers, Swagger, and API Explorer
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ? Configure CORS for React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // React development server
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});
var app = builder.Build();

// ? Apply any pending migrations automatically
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<LibraryContext>();
    db.Database.Migrate();
}

// ? Enable Swagger only in Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ? Enable CORS
app.UseCors("ReactPolicy");

// ? Middleware setup
app.UseHttpsRedirection();
app.UseAuthorization();

// ? Map API Controllers
app.MapControllers();

// ? Run the app
app.Run();
