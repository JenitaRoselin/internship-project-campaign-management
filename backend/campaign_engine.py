import json
from huggingface_hub import InferenceClient

class CampaignEngine:
    def __init__(self, hf_token):
        self.client = InferenceClient(api_key=hf_token)

    def generate_copy(self, tenant_name, item, price, cat, disc, segmentation_results, other_details=None):
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
            {f'Notes: {other_details}' if other_details else ''}

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
    
    def generate_segment_message(self, tenant_name, segment_name, tone="Professional", objective="Sales", context=""):
        """Generate a single message for a specific segment based on tone and objective"""
        
        # Build tone-specific instructions
        tone_map = {
            "Professional": "formal, respectful, and business-like",
            "Friendly": "warm, conversational, and approachable",
            "Urgent": "time-sensitive, action-oriented, and compelling",
            "Festive": "celebratory, joyful, and exciting"
        }
        
        objective_map = {
            "Sales": "drive immediate purchases with attractive offers",
            "Engagement": "encourage interaction and build relationships",
            "Retention": "reward loyalty and strengthen connections",
            "Awareness": "introduce new products and educate customers"
        }
        
        tone_desc = tone_map.get(tone, tone)
        objective_desc = objective_map.get(objective, objective)
        
        prompt = f"""
        Role: Marketing Expert for {tenant_name}.
        Target Audience: {segment_name} segment.
        Tone: {tone_desc}.
        Objective: {objective_desc}.
        {f'Additional Context: {context}' if context else ''}
        
        Task: Create a personalized marketing email in JSON format.
        
        STRICT RULES:
        1. DO NOT mention segment names or technical terms.
        2. Keep message natural and customer-focused.
        3. Match the specified tone perfectly.
        4. Align with the campaign objective.
        
        Format: {{"subject": "...", "body": "..."}}
        """
        
        try:
            response = self.client.chat.completions.create(
                model="Qwen/Qwen2.5-7B-Instruct",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=400
            )
            text = response.choices[0].message.content.strip()
            if "```" in text:
                text = text.split("json")[-1].split("```")[0].strip()
            content = json.loads(text)
            
            return content.get('body', f"Dear Valued Customer, {context}")
        except Exception as e:
            print(f"AI generation error: {e}")
            return f"Dear Valued Customer,\n\n{context}\n\nBest regards,\n{tenant_name} Team"