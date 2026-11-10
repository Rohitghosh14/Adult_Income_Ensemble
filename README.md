# Adult Income: leak-proof pipeline and ensemble comparison

A learning project. It predicts whether a person earns more than 50K, using the Adult Census Income data (OpenML, about 48,000 rows). The goal was a leak-proof scikit-learn Pipeline and an honest comparison of ensemble methods.

**This model must not be used to make real decisions about people.** It is a practice project on 1994 census data.

## What is inside the Pipeline
`clean_adult` (custom step in `src/`) -> median fill and scaling for numbers -> "Missing" label and one-hot encoding for text (rare categories grouped) -> model. Everything that learns from data is inside the Pipeline and fitted on train only.

## Method
- 52 duplicate rows dropped, then a stratified 80/20 split (39032 train, 9758 test, random_state=42)
- All models compared with the same 5 stratified folds, on train only
- The noise rule: noise = std / sqrt(5). A gap smaller than the noise is a tie, and among tied models the simplest wins
- The test set was used once, for one model and one threshold chosen beforehand

## Model comparison (5-fold CV on train, sorted by PR-AUC)
| Model | Accuracy | F1 | PR-AUC | Fit time (s) |
|---|---|---|---|---|
| HistGradientBoosting | 0.8733 | 0.7117 | 0.8308 | 1.2 |
| Stacking | 0.8732 | 0.7111 | 0.8303 | 14.1 |
| Voting (soft) | 0.8674 | 0.6956 | 0.8128 | 3.0 |
| AdaBoost | 0.8583 | 0.6664 | 0.7916 | 8.6 |
| Logistic Regression | 0.8527 | 0.6624 | 0.7676 | 0.8 |
| Bagging | 0.8470 | 0.6623 | 0.7645 | 4.5 |
| Random Forest | 0.8491 | 0.6634 | 0.7509 | 1.9 |
| Decision tree (depth 5) | 0.8524 | 0.6438 | 0.7037 | 0.5 |
| Extra Trees | 0.8328 | 0.6307 | 0.6292 | 2.3 |
| Dummy (always <=50K) | 0.7606 | 0.0000 | 0.2394 | 0.4 |

Stacking is tied with HistGradientBoosting, but takes about 12 times longer, so the simpler model was chosen. Tuning (a small grid and a random search) gave no gain bigger than the noise, so the default settings were kept.

## Final result (test set, 9758 rows, threshold 0.4)
PR-AUC 0.820. For the class >50K: precision 0.70, recall 0.73, F1 0.72. Accuracy 0.86. The threshold 0.4 was chosen on train predictions (best F1).

## Limitations
- The data is from 1994 and may not describe people today
- The class >50K is only 24% of the rows, and about 1 in 4 high earners is still missed
- Columns like sex, race and native-country are in the data, and **no fairness check was done** in this project
- One test set of 9758 rows gives one estimate, with its own noise

## Run it
`uv sync`, then open `notebooks/01_audit.ipynb` and run all cells. The model file is created in `models/` (it is not stored in Git).

## Credits
Learning project, built step by step with an AI tutor (Claude). The code was run and checked by me.