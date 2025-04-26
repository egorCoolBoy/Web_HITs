using System;
using System.Collections.Generic;

namespace DigitRecognizer
{
    public class Layer
    {
        public List<Neuron> Neurons = new List<Neuron>();
        public Func<double, double> Activation;
        public Func<double, double> Derivative;

        public Layer(int inputCount, int neuronCount, Func<double, double> activation, Func<double, double> derivative, Random random)
        {
            Activation = activation;
            Derivative = derivative;
            for (int i = 0; i < neuronCount; i++)
                Neurons.Add(new Neuron(inputCount, random));
        }

        public double[] FeedForward(double[] inputs)
        {
            double[] outputs = new double[Neurons.Count];
            for (int i = 0; i < Neurons.Count; i++)
                outputs[i] = Neurons[i].Activate(inputs, Activation);
            return outputs;
        }
    }
}
