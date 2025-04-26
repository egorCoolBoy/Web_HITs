using System;

namespace DigitRecognizer
{
    public class Neuron
    {
        public double[] Weights;
        public double Bias;
        public double Output;
        public double Delta;

        public Neuron(int inputCount, Random random)
        {
            Weights = new double[inputCount];
            for (int i = 0; i < inputCount; i++)
                Weights[i] = random.NextDouble() * 2 - 1;

            Bias = random.NextDouble() * 2 - 1;
        }

        public double Activate(double[] inputs, Func<double, double> activation)
        {
            double sum = Bias;
            for (int i = 0; i < inputs.Length; i++)
                sum += inputs[i] * Weights[i];
            Output = activation(sum);
            return Output;
        }
    }
}
