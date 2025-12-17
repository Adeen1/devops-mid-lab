
import sys

def extract_text(pdf_path):
    try:
        # Try importing pypdf or PyPDF2 if available
        try:
            from pypdf import PdfReader
        except ImportError:
            try:
                from PyPDF2 import PdfReader
            except ImportError:
                print("No PDF library found (pypdf or PyPDF2).")
                return

        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        with open("pdf_content.txt", "w", encoding="utf-8") as f:
            f.write(text)
        print("Text written to pdf_content.txt")
    except Exception as e:
        print(f"Error reading PDF: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        extract_text(sys.argv[1])
    else:
        print("Please provide a PDF file path.")
