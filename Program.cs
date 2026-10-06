using SkyNet;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddHttpContextAccessor(); // 1. Add HttpContext Service

var app = builder.Build();

app.UseMiddleware<IHandler>(); // 2. use SKYNET.IHANDLER as middleware service
app.UseStaticHttpCurrent(); // 3. use static http class service

app.Run();