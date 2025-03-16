from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import os
import httpx
import json
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent / '.env'
print(f"Looking for .env file at: {env_path}")
load_dotenv(dotenv_path=env_path)

# Debug environment variables
api_key = os.getenv("GOOGLE_SEARCH_API_KEY")
cx_id = os.getenv("GOOGLE_SEARCH_CX")
print(f"API Key loaded: {bool(api_key)}")
print(f"CX ID loaded: {bool(cx_id)}")

app = FastAPI()

# Configure CORS with more permissive settings for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # More permissive for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class CollegeData(BaseModel):
    status: str
    data: List[Dict[str, Any]]

class ParameterData(BaseModel):
    status: str
    data: List[str]

class SearchResult(BaseModel):
    title: str
    link: str
    snippet: str
    source: str

class SearchResponse(BaseModel):
    results: List[SearchResult]

# Get the path to the CSV file - check multiple possible locations
def get_csv_path():
    """
    Get the path to the CSV file by checking multiple possible locations.
    Also prints debug information about the file search.
    """
    # First check if CSV_PATH environment variable is set
    csv_path_env = os.getenv("CSV_PATH")
    if csv_path_env:
        print(f"CSV_PATH environment variable is set to: {csv_path_env}")
        if os.path.exists(csv_path_env):
            print(f"CSV file found at environment variable path: {csv_path_env}")
            return csv_path_env
        else:
            print(f"CSV file NOT found at environment variable path: {csv_path_env}")
    
    possible_paths = [
        "Scores with Names.csv",  # Current directory
        "/app/data/Scores with Names.csv",  # New mounted directory
        "/app/Scores with Names.csv",  # Docker container root
        os.path.join(os.path.dirname(os.path.dirname(__file__)), "Scores with Names.csv"),  # Parent directory
        os.path.join(os.path.dirname(__file__), "Scores with Names.csv"),  # Same directory as script
        os.path.join(os.path.dirname(__file__), "sample.csv"),  # Fallback sample file
    ]
    
    # Debug: Print current directory and file existence
    current_dir = os.getcwd()
    print(f"Current directory: {current_dir}")
    print(f"Files in current directory: {os.listdir(current_dir)}")
    
    # If /app/data exists, list its contents
    data_dir = "/app/data"
    if os.path.exists(data_dir):
        print(f"Files in {data_dir}: {os.listdir(data_dir)}")
    
    # Check each possible path
    for path in possible_paths:
        print(f"Checking path: {path}")
        if os.path.exists(path):
            print(f"CSV file found at: {path}")
            return path
    
    # If we get here, we couldn't find the file
    print("CSV file not found in any of the expected locations")
    print(f"Possible paths checked: {possible_paths}")
    
    # Create and return a sample CSV file as a last resort
    fallback_path = os.path.join(os.path.dirname(__file__), "fallback.csv")
    try:
        print(f"Creating fallback CSV file at: {fallback_path}")
        with open(fallback_path, 'w') as f:
            f.write("ID,Name,Score1,Score2,Score3\n")
            f.write("1,College A,90,85,95\n")
            f.write("2,College B,80,90,85\n")
            f.write("3,College C,85,80,90\n")
            f.write("4,College D,95,75,80\n")
            f.write("5,College E,75,95,85\n")
        return fallback_path
    except Exception as e:
        print(f"Error creating fallback CSV: {str(e)}")
        # Return the first path as default, but it will likely fail
        return possible_paths[0]

@app.get("/api/colleges", response_model=CollegeData)
async def get_colleges():
    """
    Load and return college data from CSV file
    """
    try:
        csv_path = get_csv_path()
        print(f"Using CSV path: {csv_path}")
        
        if not os.path.exists(csv_path):
            error_msg = f"CSV file not found at: {csv_path}"
            print(error_msg)
            raise FileNotFoundError(error_msg)
        
        # Check file size and permissions
        file_size = os.path.getsize(csv_path)
        print(f"CSV file size: {file_size} bytes")
        
        # Try to read the file content directly first
        try:
            with open(csv_path, 'r', encoding='utf-8') as f:
                first_few_lines = ''.join(f.readlines(10))
                print(f"First few lines of CSV file:\n{first_few_lines}")
        except Exception as read_error:
            print(f"Error reading CSV file directly: {str(read_error)}")
        
        # Now try with pandas
        try:
            print("Attempting to read CSV with pandas...")
            df = pd.read_csv(csv_path)
            print(f"CSV loaded successfully. Shape: {df.shape}")
            print(f"CSV columns: {df.columns.tolist()}")
            
            colleges = df.to_dict(orient='records')
            return {"status": "success", "data": colleges}
        except Exception as pandas_error:
            print(f"Error reading CSV with pandas: {str(pandas_error)}")
            # Try with different encoding
            try:
                print("Trying with different encoding (latin-1)...")
                df = pd.read_csv(csv_path, encoding='latin-1')
                colleges = df.to_dict(orient='records')
                return {"status": "success", "data": colleges}
            except Exception as encoding_error:
                print(f"Error with alternative encoding: {str(encoding_error)}")
                raise
    except Exception as e:
        error_msg = f"Error processing CSV file: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

@app.get("/api/parameters", response_model=ParameterData)
async def get_parameters():
    """
    Return available parameters for sorting
    """
    try:
        csv_path = get_csv_path()
        print(f"Using CSV path: {csv_path}")
        
        if not os.path.exists(csv_path):
            error_msg = f"CSV file not found at: {csv_path}"
            print(error_msg)
            raise FileNotFoundError(error_msg)
        
        # Check file size and permissions
        file_size = os.path.getsize(csv_path)
        print(f"CSV file size: {file_size} bytes")
        
        # Try to read the file content directly first
        try:
            with open(csv_path, 'r', encoding='utf-8') as f:
                first_few_lines = ''.join(f.readlines(10))
                print(f"First few lines of CSV file:\n{first_few_lines}")
        except Exception as read_error:
            print(f"Error reading CSV file directly: {str(read_error)}")
        
        # Now try with pandas
        try:
            print("Attempting to read CSV with pandas...")
            df = pd.read_csv(csv_path)
            print(f"CSV loaded successfully. Shape: {df.shape}")
            print(f"CSV columns: {df.columns.tolist()}")
            
            # Get numerical columns only, excluding ID and Name
            numeric_columns = df.select_dtypes(include=['float64', 'int64']).columns.tolist()
            print(f"Numeric columns: {numeric_columns}")
            
            return {"status": "success", "data": numeric_columns}
        except Exception as pandas_error:
            print(f"Error reading CSV with pandas: {str(pandas_error)}")
            # Try with different encoding
            try:
                print("Trying with different encoding (latin-1)...")
                df = pd.read_csv(csv_path, encoding='latin-1')
                numeric_columns = df.select_dtypes(include=['float64', 'int64']).columns.tolist()
                return {"status": "success", "data": numeric_columns}
            except Exception as encoding_error:
                print(f"Error with alternative encoding: {str(encoding_error)}")
                raise
    except Exception as e:
        error_msg = f"Error processing CSV file: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

@app.get("/api/search", response_model=SearchResponse)
async def search_web(q: str):
    try:
        # Get the API key from environment variables
        api_key = os.getenv("GOOGLE_SEARCH_API_KEY")
        cx = os.getenv("GOOGLE_SEARCH_CX")

        # Debug logging
        print("API Key present:", bool(api_key))
        print("CX ID present:", bool(cx))

        if not api_key or not cx:
            print("API keys not configured, returning mock data")
            return SearchResponse(results=create_mock_results(q))

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    "https://www.googleapis.com/customsearch/v1",
                    params={
                        "key": api_key,
                        "cx": cx,
                        "q": q,
                        "num": 5
                    },
                    timeout=10.0
                )
                
                # Handle rate limiting
                if response.status_code == 429:
                    print(f"Rate limit reached for Google Search API, returning mock data for query: {q}")
                    return SearchResponse(results=create_mock_results(q))
                
                if response.status_code == 200:
                    data = response.json()
                    if "items" in data:
                        results = []
                        for item in data["items"]:
                            source = item.get("displayLink", "")
                            if "youtube.com" in source:
                                source = "YouTube"
                            elif "reddit.com" in source:
                                source = "Reddit"
                            elif "linkedin.com" in source:
                                source = "LinkedIn"
                            elif "quora.com" in source:
                                source = "Quora"
                            
                            results.append(SearchResult(
                                title=item.get("title", ""),
                                link=item.get("link", ""),
                                snippet=item.get("snippet", ""),
                                source=source
                            ))
                        return SearchResponse(results=results)
                    
                # If no results, return mock data instead of empty list
                print(f"No results found for query: {q}, returning mock data")
                return SearchResponse(results=create_mock_results(q))
            
            except httpx.TimeoutException:
                print(f"Search timeout for query: {q}, returning mock data")
                return SearchResponse(results=create_mock_results(q))
            
            except Exception as e:
                print(f"Search API error: {e}, returning mock data")
                return SearchResponse(results=create_mock_results(q))

    except Exception as e:
        print(f"Server error in search: {e}")
        return SearchResponse(results=create_mock_results(q))

def create_mock_results(query: str) -> List[SearchResult]:
    """Create mock search results based on the query."""
    college_name = query.split()[0]  # Get the first word as college name
    
    return [
        SearchResult(
            title=f"About {college_name} - Overview and History",
            link="https://example.com/overview",
            snippet=f"{college_name} is a prestigious educational institution known for its academic excellence and research. The college offers various undergraduate and postgraduate programs in engineering, technology, and management.",
            source="College Website"
        ),
        SearchResult(
            title=f"{college_name} - Placements and Career Opportunities",
            link="https://example.com/placements",
            snippet=f"Students at {college_name} have excellent placement opportunities with top companies. The college has a dedicated placement cell that provides career guidance and conducts regular placement drives.",
            source="Placements Portal"
        ),
        SearchResult(
            title=f"{college_name} Campus Life - Student Experience",
            link="https://example.com/campus",
            snippet=f"Experience vibrant campus life at {college_name} with modern facilities, sports complexes, and various cultural activities. The college hosts annual technical and cultural festivals.",
            source="Student Blog"
        ),
        SearchResult(
            title=f"{college_name} Research and Innovation",
            link="https://example.com/research",
            snippet=f"{college_name} is at the forefront of research and innovation with state-of-the-art laboratories and research centers. Faculty and students actively participate in cutting-edge research projects.",
            source="Research Portal"
        ),
        SearchResult(
            title=f"{college_name} Alumni Network",
            link="https://example.com/alumni",
            snippet=f"Join the vast network of successful {college_name} alumni spread across the globe. Our alumni have achieved remarkable success in various fields and continue to contribute to the college's growth.",
            source="Alumni Association"
        )
    ]

@app.get("/health")
async def health_check():
    """
    Simple health check endpoint
    """
    return {"status": "ok", "message": "API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 