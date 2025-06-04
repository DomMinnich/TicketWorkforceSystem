import google.generativeai as genai
from config import Config
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def configure_gemini():
    """Configures the Gemini API with the API key from settings."""
    api_key = Config.GEMINI_API_KEY
    if not api_key:
        logger.error("GEMINI_API_KEY not found in config.")
        return False
    try:
        genai.configure(api_key=api_key)
        return True
    except Exception as e:
        logger.error(f"Failed to configure Gemini: {e}")
        return False

def generate_ai_response(question: str):
    """
    Generates a response from the Gemini model based on the provided question.

    Args:
        question (str): The question to ask the AI.

    Returns:
        tuple: (response_text, error_message)
               response_text is the AI's response, or None if an error occurred.
               error_message is a string describing the error, or None if successful.
    """
    if not configure_gemini():
        return None, "Gemini API not configured. Please check the API key."

    try:
        # For a list of available models, see:
        # https://ai.google.dev/models/gemini
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        
        # Generate content
        response = model.generate_content(question)
        
        # Check for safety ratings or other issues
        if not response.candidates:
            logger.warning(f"Gemini response for question '{question}' had no candidates. Prompt feedback: {response.prompt_feedback}")
            return None, "The AI could not generate a response for this question due to content restrictions or other issues."

        if response.candidates[0].content.parts:
            response_text = "".join(part.text for part in response.candidates[0].content.parts)
            return response_text, None
        else:
            logger.warning(f"Gemini response for question '{question}' was empty.")
            return None, "The AI returned an empty response."

    except Exception as e:
        logger.error(f"Error generating AI response for question '{question}': {e}")
        # Provide a more generic error message to the user
        return None, f"An error occurred while communicating with the AI service: {str(e)}"

if __name__ == '__main__':
    # (for testing purposes)
    if Config.GEMINI_API_KEY:
        print("Attempting to configure Gemini...")
        if configure_gemini():
            print("Gemini configured successfully.")
            test_question = "What is the capital of France?"
            print(f"\nAsking Gemini: {test_question}")
            text, err = generate_ai_response(test_question)
            if err:
                print(f"Error: {err}")
            else:
                print(f"Gemini Response: {text}")

            test_question_2 = "Explain quantum computing in simple terms."
            print(f"\nAsking Gemini: {test_question_2}")
            text, err = generate_ai_response(test_question_2)
            if err:
                print(f"Error: {err}")
            else:
                print(f"Gemini Response: {text}")
        else:
            print("Failed to configure Gemini. Please check your API key and .env file.")
    else:
        print("GEMINI_API_KEY not set in .env file. Cannot run test.")