using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DMS.Application.Services;
using System.Threading.Tasks;

namespace DMS.API.Controllers
{
    [ApiController]
    [Route("api/v1/ai-context-assistant")]
    [Authorize]
    public class AIContextAssistantController : ControllerBase
    {
        private readonly AIContextAssistantService _aiService;

        public AIContextAssistantController(AIContextAssistantService aiService)
        {
            _aiService = aiService;
        }

        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] ChatRequest request)
        {
            if (string.IsNullOrEmpty(request.Question))
                return BadRequest("Question cannot be empty.");

            var response = await _aiService.ProcessQueryAsync(request.Question, request.CurrentPage);
            return Ok(new { response });
        }
    }

    public class ChatRequest
    {
        public string Question { get; set; } = string.Empty;
        public string CurrentPage { get; set; } = string.Empty;
    }
}
