using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Newtonsoft.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace DigitRecognizer
{
    [ApiController]
    [Route("api/[controller]")]
    public class DigitController : ControllerBase
    {
        private static readonly string WeightsPath = Path.Combine("TrainingData", "weights.json");
        private static readonly string TrainSamplesPath = Path.Combine("TrainingData", "samples.json");
        private static Network network = new Network(2500, new[] { 128, 64 }, 10);

        static DigitController()
        {
            Directory.CreateDirectory("TrainingData");

            if (System.IO.File.Exists(WeightsPath))
                network.LoadWeights(WeightsPath);

            if (System.IO.File.Exists(TrainSamplesPath))
                TrainFromSavedSamples();
        }

        [HttpPost("predict")]
        public IActionResult Predict([FromBody] List<int> input)
        {
            if (input == null || input.Count != 2500)
                return BadRequest("Input must contain exactly 2500 pixels.");

            var normalized = Normalize(input);
            var output = network.FeedForward(normalized);
            int predicted = output.ToList().IndexOf(output.Max());
            return Ok(new { digit = predicted });
        }

        [HttpPost("train")]
        public IActionResult Train([FromBody] TrainRequest request)
        {
            if (request.Input == null || request.Input.Count != 2500 || request.Expected < 0 || request.Expected > 9)
                return BadRequest("Invalid training data.");

            var normalized = Normalize(request.Input);
            double[] expected = new double[10];
            expected[request.Expected] = 1.0;

            for (int i = 0; i < 5; i++)
            {
                network.Train(normalized, expected, 0.05);
            }

            network.SaveWeights(WeightsPath);
            SaveTrainingSample(request.Input, request.Expected);
            SaveTrainingImage(request.Input, request.Expected);

            return Ok(new { status = "trained" });
        }

        [HttpPost("train-image")]
        public async Task<IActionResult> TrainFromImage([FromForm] IFormFile image, [FromForm] int expected)
        {
            if (image == null || expected < 0 || expected > 9)
                return BadRequest("Invalid image or label.");

            var saveDir = Path.Combine("TrainingData", "Images", expected.ToString());
            Directory.CreateDirectory(saveDir);

            var filePath = Path.Combine(saveDir, $"{Guid.NewGuid()}.png");
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            var input = ImageHelper.ExtractInputFromImage(filePath);

            double[] expectedOutput = new double[10];
            expectedOutput[expected] = 1.0;

            for (int i = 0; i < 5; i++)
                network.Train(input, expectedOutput, 0.05);

            network.SaveWeights(WeightsPath);

            return Ok(new { status = "trained from image" });
        }

        private static double[] Normalize(List<int> input)
        {
            return input.Select(x => x / 255.0).ToArray();
        }

        private static void SaveTrainingSample(List<int> rawInput, int expectedDigit)
        {
            try
            {
                Directory.CreateDirectory("TrainingData");

                List<TrainRequest> samples = new();
                if (System.IO.File.Exists(TrainSamplesPath))
                {
                    var json = System.IO.File.ReadAllText(TrainSamplesPath);
                    samples = JsonConvert.DeserializeObject<List<TrainRequest>>(json) ?? new List<TrainRequest>();
                }

                samples.Add(new TrainRequest
                {
                    Input = rawInput,
                    Expected = expectedDigit
                });

                var outputJson = JsonConvert.SerializeObject(samples, Formatting.Indented);
                System.IO.File.WriteAllText(TrainSamplesPath, outputJson);
            }
            catch
            {
            }
        }

        private static void SaveTrainingImage(List<int> input, int expectedDigit)
        {
            try
            {
                var dir = Path.Combine("TrainingData", "Images", expectedDigit.ToString());
                Directory.CreateDirectory(dir);

                var path = Path.Combine(dir, $"{Guid.NewGuid()}.png");
                ImageHelper.SaveInputAsImage(input, path);
            }
            catch
            {
            }
        }

        private static void TrainFromSavedSamples()
        {
            try
            {
                var json = System.IO.File.ReadAllText(TrainSamplesPath);
                var samples = JsonConvert.DeserializeObject<List<TrainRequest>>(json);

                if (samples == null) return;

                for (int epoch = 0; epoch < 10; epoch++)
                {
                    foreach (var sample in samples)
                    {
                        var normalized = Normalize(sample.Input);
                        double[] expected = new double[10];
                        expected[sample.Expected] = 1.0;
                        network.Train(normalized, expected, 0.05);
                    }
                }

                network.SaveWeights(WeightsPath);
            }
            catch
            {
            }
        }
    }
}
