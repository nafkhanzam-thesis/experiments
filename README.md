# nafkhanzam-thesis/experiments

## Data Filling Steps

### Translation steps

|                         | **amr** | **amr_dfs** | **en** | **id** | **en_back** | **en_alt** | **id_alt** | **en_alt_back** |
| ----------------------- | ------- | ----------- | ------ | ------ | ----------- | ---------- | ---------- | --------------- |
| **LDC2017-test**        | 0       | -           | 0      | 0      | -           | -          | -          | -               |
| **LDC2020-train-dev**   | 0       | 2           | 0      | 4      | 5           | 3          | 4          | 5               |
| **PANL-BPPT & IWSLT17** | 1       | 2           | 0      | 0      | -           | 3          | 4          | 5               |

- 0: Available data.
- 1: AMR parse parallel corpora.
- 2: DFS linearize AMRs.
- 3: AMR-to-text AMRs to EN-ALTs as an alternative to ENs.
- 4: Translate ENs to IDs.
- 5: Translate IDs to ENs back.

### Inserting to database

All the translation results are then inserted to ScyllaDB.

### Evaluation steps

1. Encode each `en` and `id` sentences (except `back`) using LaBSE encoder.
2. Compute BLEU scores for each `en` and `en_back` pair.
3. Compute BLEU scores for `en` and `en_alt`.

## Schema

Dataset will be saved in a columnar database like Cassandra or Scylla.
I will be using ScyllaDB.

Key columns:

- `data_source` {LDC2017,LDC2020,PANL-BPPT,IWSLT17}
- `split` {train,dev,test}
- `index` {0..*}

AMR columns:

- `amr`: PENMAN-format AMR.
- `amr_dfs`: DFS-format AMR.

Original sentence pairs:

- `en`: English sentence.
- `id`: Indonesian translation of `en`.
- `en__labse`: LaBSE-encoded `en`.
- `id__labse`: LaBSE-encoded `id`.
- `en_back`: English translation back of `id`.
- `en__en_back__bleu`: BLEU score between `en` and `en_back`.

AMR-to-text sentence pairs:

- `en_alt`: AMR-to-text of `amr`.
- `id_alt`: Indonesian translation of `en_alt`.
- `en_alt__labse`: LaBSE-encoded `en_alt`.
- `id_alt__labse`: LaBSE-encoded `id_alt`.
- `en_alt_back`: English translation back of `id_alt`.
- `en_alt__en_alt_back__bleu`: BLEU score between `en_alt` and `en_alt_back`.
- `en__en_alt__bleu`: BLEU score between `en` and `en_alt`.

### Data Definition

Keyspace:

```sql
CREATE KEYSPACE thesis
WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1}
AND durable_writes = true;
```

Table:

```sql
CREATE TABLE data (
  data_source text,
  split text,
  idx int,

  amr text,
  amr_dfs text,

  en text,
  id text,
  en__labse list<double>,
  id__labse list<double>,
  labse_distance double,
  id__en__nn_rank int,
  en_back text,
  en__en_back__bleu double,

  en_alt text,
  id_alt text,
  en_alt__labse list<double>,
  id_alt__labse list<double>,
  alt__labse_distance double,
  id_alt__en_alt__nn_rank int,
  en_alt_back text,
  en_alt__en_alt_back__bleu double,

  en__en_alt__bleu double,

  PRIMARY KEY (data_source, split, idx)
);
```
