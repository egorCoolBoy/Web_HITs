using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using System.IO;
using System.Linq;
namespace DigitRecognizer
{
    public static class ImageHelper
    {
        public static double[] ExtractInputFromImage(string path)
        {
            using (var image = Image.Load<L8>(path))
            {
                if (image.Width != 50 || image.Height != 50)
                {
                    image.Mutate(x => x.Resize(50, 50));
                }

                double[] result = new double[50 * 50];
                for (int y = 0; y < 50; y++)
                {
                    for (int x = 0; x < 50; x++)
                    {
                        var pixel = image[x, y];
                        result[y * 50 + x] = pixel.PackedValue / 255.0;
                    }
                }

                return result;
            }
        }

        public static void SaveInputAsImage(List<int> input, string path)
        {
            using (var image = new Image<L8>(50, 50))
            {
                for (int y = 0; y < 50; y++)
                {
                    for (int x = 0; x < 50; x++)
                    {
                        int value = input[y * 50 + x];
                        image[x, y] = new L8((byte)Math.Clamp(value, 0, 255));
                    }
                }

                image.Save(path);
            }
        }
    }
}
