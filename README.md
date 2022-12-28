# nafkhanzam-thesis/experiments

## Data Filling Steps

|                         | **AMR** | **AMR-DFS** | **EN** | **ID** | **EN-BACK** | **EN-ALT** | **ID-ALT** | **EN-ALT-BACK** |
| ----------------------- | ------- | ----------- | ------ | ------ | ----------- | ---------- | ---------- | --------------- |
| **LDC2017-test**        | 0       | -           | 0      | 0      | -           | -          | -          | -               |
| **LDC2020**             | 0       | 2           | 0      | 4      | 5           | 3          | 4          | 5               |
| **PANL-BPPT & IWSLT17** | 1       | 2           | 0      | 0      | -           | 3          | 4          | 5               |

- 0: Available data.
- 1: AMR parse parallel corpora.
- 2: DFS linearize AMRs.
- 3: AMR-to-text AMRs to EN-ALTs as an alternative to ENs.
- 4: Translate ENs to IDs.
- 5: Translate IDs to ENs back.
