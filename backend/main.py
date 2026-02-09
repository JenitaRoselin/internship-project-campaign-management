from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from customer_segmentation_ai import CustomerSegmentationAI
import pandas as pd
import io

app = FastAPI()

# Enable CORS so your Next.js frontend (localhost:3000) can talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the AI Model
ai_model = CustomerSegmentationAI(n_clusters=4)

@app.post("/api/segment-customers")
async def segment_customers(file: UploadFile = File(...)):
    # 1. Validate file type
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV.")

    try:
        # 2. Read the uploaded CSV into a Pandas DataFrame
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))

        # 3. Process data using your AI Class
        segmented_df = ai_model.process_dataframe(df)

        # 4. Prepare data for the frontend
        # Convert the dataframe to a list of dictionaries (JSON compatible)
        records = segmented_df.to_dict(orient="records")
        
        # Get aggregate stats for the dashboard cards
        stats = ai_model.get_segment_stats(segmented_df)

        return {
            "status": "success",
            "count": len(segmented_df),
            "data": records,
            "summary": stats
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing CSV: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)