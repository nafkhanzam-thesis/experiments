# Directory Structure

## Data

```bash
❯ tree data -L 2
data
├── amr-release-2.0-amrs-test-all.sentences.ms.txt
├── LDC2017
│   ├── data
│   ├── docs
│   └── index.html
└── LDC2020
    ├── data
    ├── docs
    └── index.html

6 directories, 3 files
```

## Outputs

```bash
❯ tree outputs -L 3
outputs
└── 0-amr-process
    ├── LDC2017
    │   ├── test.amr
    │   ├── test.jsonl
    │   ├── test.txt
    │   ├── train.amr
    │   ├── train.jsonl
    │   ├── train.txt
    │   ├── val.amr
    │   ├── val.jsonl
    │   └── val.txt
    └── LDC2020
        ├── test.amr
        ├── test.jsonl
        ├── test.txt
        ├── train.amr
        ├── train.jsonl
        ├── train.txt
        ├── val.amr
        ├── val.jsonl
        └── val.txt

3 directories, 18 files
```
