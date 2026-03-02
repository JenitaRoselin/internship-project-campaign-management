from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import io

# Import your classes
from customer_segmentation_ai import CustomerSegmentationAI
from campaign_engine import CampaignEngine

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- INITIALIZATION ---
ai_model = CustomerSegmentationAI(n_clusters=4)
# REPLACE WITH YOUR ACTUAL TOKEN
HF_TOKEN = "your-huggingFace-token"
campaign_engine = CampaignEngine(hf_token=HF_TOKEN)

# --- MODELS ---
class CampaignRequest(BaseModel):
    tenant_name: str
    item: str
    price: float
    cat: str
    disc: int
    customer_data: List[dict] # Must match segmentData from frontend

# --- ENDPOINTS ---
@app.post("/api/segment-customers")
async def segment_customers(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        segmented_df = ai_model.process_dataframe(df)
        records = segmented_df.to_dict(orient="records")
        stats = ai_model.get_segment_stats(segmented_df)
        return {"status": "success", "data": records, "summary": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-campaign")
async def generate_campaign(req: CampaignRequest):
    try:
        # Crucial: Use the globally initialized campaign_engine
        campaigns = campaign_engine.generate_copy(
            req.tenant_name, 
            req.item, 
            req.price, 
            req.cat, 
            req.disc, 
            req.customer_data
        )
        return {"status": "success", "campaigns": campaigns}
    except Exception as e:
        print(f"ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
