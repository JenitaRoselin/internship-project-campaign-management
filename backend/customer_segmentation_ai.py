import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA

class CustomerSegmentationAI:
    def __init__(self, n_clusters=4):
        self.n_clusters = n_clusters
        self.scaler = StandardScaler()
        self.pca = PCA(n_components=2)
        self.kmeans = KMeans(n_clusters=self.n_clusters, random_state=42, n_init=10)
        self.features = ['recency', 'frequency', 'monetary', 'discount_given']
        self.segment_name_map = {
            0: 'Premium Customers',
            1: 'Price-Sensitive Customers',
            2: 'Explorers',
            3: 'Occasional Buyers'
        }

    def process_dataframe(self, df: pd.DataFrame):
        # 1. Basic Cleaning
        df['send_timestamp'] = pd.to_datetime(df['send_timestamp'])
        
        # 2. RFM Aggregation
        rfm = df.groupby('customer_id').agg(
            recency=('send_timestamp', lambda x: (df['send_timestamp'].max() - x.max()).days),
            frequency=('customer_id', 'count'),
            monetary=('item_price', 'sum'),
            discount_given=('discount_given', 'mean')
        ).reset_index()

        # --- CHANGE 1: Handle missing data ---
        # K-Means cannot handle NaN values. We fill them to avoid errors.
        rfm[self.features] = rfm[self.features].fillna(0)

        # 3. Feature Scaling
        X = rfm[self.features]
        X_scaled = self.scaler.fit_transform(X)

        # 4. K-Means Clustering
        rfm['cluster'] = self.kmeans.fit_predict(X_scaled)
        rfm['segment_name'] = rfm['cluster'].map(self.segment_name_map)

        # 5. PCA for Frontend Visualization
        X_pca = self.pca.fit_transform(X_scaled)
        
        # --- CHANGE 2: Rounding for JSON compatibility ---
        # This prevents "Out of range float" errors in the browser
        rfm['pc1'] = np.round(X_pca[:, 0], 4)
        rfm['pc2'] = np.round(X_pca[:, 1], 4)
        rfm['monetary'] = np.round(rfm['monetary'], 2)

        return rfm

    def get_segment_stats(self, rfm_df):
        """Returns summary stats formatted for frontend cards."""
        stats = rfm_df.groupby('segment_name').agg({
            'customer_id': 'count',
            'monetary': 'mean',
            'recency': 'mean'
        }).rename(columns={'customer_id': 'count'})
        
        # Round the means for a cleaner UI
        return stats.round(2).to_dict(orient='index')

if __name__ == "__main__":
    print("AI Class Loaded Successfully with Data Guardrails.")