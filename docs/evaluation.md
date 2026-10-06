# SmartMess Model Evaluation & Benchmarking Methodology

This document outlines the formal quantitative metrics used to benchmark the Random Forest demand forecaster against baseline models.

---

## 1. Quantitative Evaluation Metrics

### Mean Absolute Error (MAE)
Measures the average magnitude of absolute errors between predicted headcount ($\hat{y}_i$) and actual diner attendance ($y_i$):
$$\text{MAE} = \frac{1}{n} \sum_{i=1}^{n} |y_i - \hat{y}_i|$$
*Interpretation*: An MAE of 16.8 means our forecast deviates by an average of only ~17 meals out of a 1,215-student population.

---

### Root Mean Squared Error (RMSE)
Heavily penalizes large variance outliers by squaring differences before averaging:
$$\text{RMSE} = \sqrt{\frac{1}{n} \sum_{i=1}^{n} (y_i - \hat{y}_i)^2}$$

---

### Mean Absolute Percentage Error (MAPE) — Division-by-Zero Protected
Computes relative percentage error while guaranteeing numerical stability when actual attendance is zero:
$$\text{MAPE} = \frac{100\%}{n} \sum_{i=1}^{n} \frac{|y_i - \hat{y}_i|}{\max(y_i, 1.0)}$$

---

### Coefficient of Determination ($R^2$)
Measures the proportion of variance in diner attendance explained by model features:
$$R^2 = 1 - \frac{\sum (y_i - \hat{y}_i)^2}{\sum (y_i - \bar{y})^2}$$

---

## 2. Benchmark Comparison on Test Holdout

| Model Architecture | MAE (meals) | RMSE (meals) | MAPE (%) | $R^2$ Score | Evaluation Split |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Baseline (7-Day Moving Average)** | 63.88 | 80.45 | 5.81% | -0.128 | Chronological Holdout (41 records) |
| **Random Forest (SmartMess)** | **16.80** | **21.55** | **1.56%** | **0.919** | Chronological Holdout (41 records) |
| **Net Improvement** | **-47.08 meals (73.7% reduction)** | **-58.90 meals** | **-4.25% error** | **+1.047 gain** | — |

---

## 3. Explainable AI & Feature Attribution

Gini impurity decrease across decision tree split points reveals:
1. **Meal Slot Baseline (Breakfast/Lunch/Dinner)**: ~38% weight
2. **7-Day Moving Average Turnout**: ~26% weight
3. **Day-of-Week Seasonality (Friday Dip / Weekend Eve)**: ~16% weight
4. **Recipe Popularity Index**: ~11% weight
5. **Academic Calendar (Exams / Festivals)**: ~9% weight
