
import asyncio
from services.analysis_service import AnalysisService
import os
import json
import traceback

async def main():
    try:
        print("Initializing Service...")
        service = AnalysisService()
        
        # Get the first file in uploads
        files = os.listdir("uploads")
        if not files:
            print("No files found in uploads/")
            return

        image_path = os.path.join("uploads", files[0])
        print(f"Analyzing: {image_path}")
        
        result = await service.analyze_image(image_path)
        
        output_file = "test_result.json"
        with open(output_file, "w") as f:
            json.dump(result, f, indent=2)
            
        print(f"Analysis complete. Result saved to {output_file}")
        print("Result Preview:")
        print(json.dumps(result, indent=2))

    except Exception as e:
        print(f"Test crashed: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
