import numpy as np
import tensorflow as tf


def calculate_cosine_distances(x, embeddings):
    cosine_distances = 1 + tf.keras.losses.cosine_similarity(x, embeddings)
    return cosine_distances.numpy()


def cosine_distance_batch(A, B_batch):
    return calculate_cosine_distances(np.array(A), np.array(B_batch))
