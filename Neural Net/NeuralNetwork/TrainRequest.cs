using System.Collections.Generic;

namespace DigitRecognizer
{
    public class TrainRequest
    {
        public List<int> Input { get; set; }
        public int Expected { get; set; }
    }
}
