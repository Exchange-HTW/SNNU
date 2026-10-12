from database import engine, Base, SessionLocal
from models import School, Language, Audience

def seed_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Seed Languages
    if not db.query(Language).first():
        langs = [
            Language(code="en", name="English"),
            Language(code="es", name="Español"),
            Language(code="de", name="Deutsch")
        ]
        db.add_all(langs)

    # Seed Audiences
    if not db.query(Audience).first():
        audiences = [
            Audience(name="Student", description="Undergraduate or graduate students looking for opportunities."),
            Audience(name="Researcher", description="Academics looking for collaboration or publications."),
            Audience(name="Company", description="Industry partners looking for innovation."),
            Audience(name="Investor", description="Venture capitalists looking to fund startups.")
        ]
        db.add_all(audiences)

    # Seed Schools
    if not db.query(School).first():
        schools = [
            School(name="HTW Saar", description="Saarland University of Applied Sciences.", base_info="The Neural Engineering Lab at HTW Saar focuses on Brain Computer Interfaces, translational research, non-invasive brain monitoring, and digital realities."),
            School(name="MIT", description="Massachusetts Institute of Technology.", base_info="MIT's Brain and Cognitive Sciences department leads the world in understanding the mind through computation and engineering."),
            School(name="Stanford", description="Stanford University.", base_info="Stanford Neurosciences Institute fosters interdisciplinary research combining engineering, medicine, and humanities."),
            School(name="Universidad de Yucatán", description="UADY.", base_info="Leading research in Mexico focusing on clinical translation and local healthcare challenges.")
        ]
        db.add_all(schools)

    db.commit()
    db.close()
    print("Database seeded successfully.")

if __name__ == "__main__":
    seed_data()
