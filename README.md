Student Engagement Analysis System
1. Overview
The Student Engagement Analysis System is a rule-based, AI-assisted solution designed to evaluate student engagement in online learning environments. The system integrates Google Forms, Google Sheets, and ChatGPT to collect, process, and analyze structured engagement data.

This project demonstrates how no-code tools combined with AI can generate actionable insights for educators without relying on real-time tracking or predictive machine learning models.

2. Objectives
Measure student engagement using structured post-class data
Provide a transparent and interpretable scoring mechanism
Identify at-risk students using rule-based logic
Analyze qualitative feedback through AI-driven sentiment classification
Support educators with data-driven teaching recommendations
3. System Architecture
3.1 Data Collection
Engagement data is collected post-class using Google Forms, including:

Participation rating (self-reported or instructor-assigned)
Quiz score (percentage)
Chat activity summary (manual input)
Written student feedback
3.2 Data Processing
Collected data is stored and processed in Google Sheets, where:

Engagement scores are calculated
Weekly trends are tracked
Dashboards are generated
4. Engagement Scoring Model
The system uses a weighted rule-based scoring model:

Component	Weight
Participation Rating	40%
Quiz Performance	40%
Feedback Sentiment	20%
Scoring Formula:

Engagement Score = (Participation × 0.4) + (Quiz × 0.4) + (Sentiment × 0.2)
5. Student Segmentation
Students are categorized based on their engagement scores:

Category	Score Range
High Engagement	≥ 75%
Medium Engagement	50% – 74%
Low Engagement	< 50%
6. Sentiment Analysis
Student feedback is analyzed using ChatGPT

Responses are classified into:

Positive
Neutral
Negative
Weekly sentiment distribution is tracked for trend analysis

7. At-Risk Student Identification
Students are flagged as At Risk based on predefined rules:

Engagement score below 45%
OR a consistent decline in engagement across two consecutive weeks
This approach is deterministic and does not use probabilistic or predictive models.

8. Dashboard and Visualization
A dynamic dashboard is maintained in Google Sheets, providing:

Class-level engagement trends
Individual student performance tracking
Sentiment distribution visualizations
Weekly comparative analysis
9. AI-Generated Insights
Using structured prompts, ChatGPT generates educator recommendations based on:

Declining engagement patterns
Increased negative sentiment
Low quiz performance trends
These insights support informed instructional decisions.

10. Reporting
Weekly reports are designed using Canva and include:

Overall class engagement metrics
Student distribution across engagement categories
Identified at-risk students
AI-generated instructional recommendations
11. Demonstration Scope
The project includes:

Multi-week dataset covering multiple students
Variation in engagement scores over time
At-risk student detection scenarios
AI-generated feedback and recommendations
Sample weekly reports
Documented system constraints
12. Technology Stack
Google Forms – Data collection
Google Sheets – Data processing, scoring, and dashboards
ChatGPT – Sentiment analysis and recommendation generation
Canva – Report design and visualization
13. Limitations
No real-time engagement tracking
Manual input required for certain data points
Sentiment classification depends on prompt design
No predictive or machine learning-based modeling
14. Future Enhancements
Integration with Learning Management Systems (LMS)
Automated data ingestion pipelines
Real-time analytics and monitoring
Advanced NLP-based sentiment analysis
Predictive modeling for early risk detection
15. Conclusion
This project provides a scalable and interpretable framework for analyzing student engagement using rule-based logic and AI-assisted insights. It highlights the practical application of no-code tools in educational analytics and supports data-driven teaching strategies.
