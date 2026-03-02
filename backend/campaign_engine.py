import json
from huggingface_hub import InferenceClient

class CampaignEngine:
    def __init__(self, hf_token):
        self.client = InferenceClient(api_key=hf_token)

    def generate_copy(self, tenant_name, item, price, cat, disc, segmentation_results):
        # 1. Group spends by segment
        segment_data = {}
        for cust in segmentation_results:
            # FIX: Use .get() to safely handle dictionary access
            name = cust.get('segment_name')
            monetary = float(cust.get('monetary', 0))
            
            if name not in segment_data:
                segment_data[name] = []
            segment_data[name].append(monetary)

        # 2. Calculate average spend and pick Top 2
        avg_spends = [
            (name, sum(vals)/len(vals)) 
            for name, vals in segment_data.items()
        ]
        top_2 = sorted(avg_spends, key=lambda x: x[1], reverse=True)[:2]

        results = []
        for seg_name, _ in top_2:
            # Determine behavioral description for the prompt
            description = "loyal, high-value shoppers" if "Premium" in seg_name else "active customers"
            
            prompt = f"""
            Role: Marketing Expert for {tenant_name}.
            Audience: {description}.
            Product: {item} ({cat}) - {disc}% Discount (Price: ₹{price}).

            Task: Write a JSON marketing email.
            
            STRICT RULES:
            1. DO NOT mention the words '{seg_name}', 'segment', or 'cluster'.
            2. Address the customer naturally (e.g., 'Hello Fashion Lover').
            3. Sign off as 'The {tenant_name} Team'.
            
            Format: {{"subject": "...", "body": "..."}}
            """

            try:
                response = self.client.chat.completions.create(
                    model="Qwen/Qwen2.5-7B-Instruct",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=500
                )
                text = response.choices[0].message.content.strip()
                if "```" in text:
                    text = text.split("json")[-1].split("```")[0].strip()
                content = json.loads(text)
            except:
                content = {"subject": f"Exclusive Offer from {tenant_name}", "body": "Check out our latest collection!"}

            results.append({
                "target_segment": seg_name,
                "subject": content.get('subject'),
                "body": content.get('body')
            })
        
        return results
