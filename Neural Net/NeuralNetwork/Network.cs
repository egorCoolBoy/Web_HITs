using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Newtonsoft.Json;

namespace DigitRecognizer
{
    public class Network
    {
        public List<Layer> Layers = new List<Layer>();
        private Random random = new Random();

        public Network(int inputCount, int[] hidden, int outputCount)
        {
            Func<double, double> sigmoid = x => 1.0 / (1.0 + Math.Exp(-x));
            Func<double, double> dSigmoid = y => y * (1 - y);

            int prev = inputCount;
            foreach (var count in hidden)
            {
                Layers.Add(new Layer(prev, count, sigmoid, dSigmoid, random));
                prev = count;
            }

            Layers.Add(new Layer(prev, outputCount, sigmoid, dSigmoid, random));
        }

        public double[] FeedForward(double[] inputs)
        {
            foreach (var layer in Layers)
                inputs = layer.FeedForward(inputs);
            return inputs;
        }

public void Train(double[] input, double[] expected, double lr)
{
    var outputs = new List<double[]>(); // Сохраняем выходы всех слоев
    var current = input;
    outputs.Add(current); // входной слой

    foreach (var layer in Layers)
    {
        current = layer.FeedForward(current);
        outputs.Add(current);
    }

    // Вычисляем ошибку выходного слоя
    double[] error = new double[expected.Length];
    for (int i = 0; i < expected.Length; i++)
        error[i] = expected[i] - outputs[^1][i]; // ^1 — последний

    // Обратное распространение
    for (int l = Layers.Count - 1; l >= 0; l--)
    {
        var layer = Layers[l];
        double[] prevOutput = outputs[l];       // выход предыдущего слоя
        double[] currentOutput = outputs[l + 1]; // выход текущего слоя

        double[] newError = new double[layer.Neurons[0].Weights.Length]; // для предыдущего слоя

        for (int n = 0; n < layer.Neurons.Count; n++)
        {
            var neuron = layer.Neurons[n];
            double output = currentOutput[n];
            double delta = error[n] * layer.Derivative(output);

            // Обновляем смещение
            neuron.Bias += delta * lr;

            // Обновляем веса
            for (int w = 0; w < neuron.Weights.Length; w++)
            {
                newError[w] += neuron.Weights[w] * delta;
                neuron.Weights[w] += prevOutput[w] * delta * lr;
            }
        }

        error = newError; // передаём ошибку назад
    }
}


        public void SaveWeights(string path)
        {
            var data = Layers.SelectMany(l => l.Neurons.Select(n =>
            {
                var weights = n.Weights.ToList();
                weights.Add(n.Bias);
                return weights;
            })).ToList();

            var json = JsonConvert.SerializeObject(data, Formatting.Indented);
            File.WriteAllText(path, json);
        }

        public void LoadWeights(string path)
        {
            if (!File.Exists(path)) return;

            var json = File.ReadAllText(path);
            var data = JsonConvert.DeserializeObject<List<List<double>>>(json);

            int index = 0;
            foreach (var layer in Layers)
            {
                foreach (var neuron in layer.Neurons)
                {
                    var weightsAndBias = data[index];
                    neuron.Weights = weightsAndBias.Take(weightsAndBias.Count - 1).ToArray();
                    neuron.Bias = weightsAndBias.Last();
                    index++;
                }
            }
        }
    }
}
