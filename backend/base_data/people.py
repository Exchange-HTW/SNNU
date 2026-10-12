# Source: https://www.snnu.uni-saarland.de/?page_id=29 (accessed 2026-08-10)
UNIT = "Systems Neuroscience & Neurotechnology Unit"
HTW = "Saarland University of Applied Sciences"
UKS = "Saarland University Hospital"
SAARBRUECKEN = "66117 Saarbrücken (Germany)"
HOMBURG = "Homburg/Saar (Germany)"
GOEBENSTRASSE = "Goebenstraße 40"


def _person(
    name,
    role,
    email,
    institution,
    building,
    location,
    *,
    lab=None,
    street=None,
    icon="fa-graduation-cap",
):
    person = {
        "name": name,
        "role": role,
        "icon": icon,
        "unit": UNIT,
        "institution": institution,
        "building": building,
        "location": location,
        "email": email,
    }
    if lab:
        person["lab"] = lab
    if street:
        person["street"] = street
    return person


PEOPLE_DATA = {
    "title": "The Minds Behind",
    "subtitle": "Meet the researchers and engineers of the Systems Neuroscience & Neurotechnology Unit.",
    "categories": [
        {
            "id": "director",
            "name": "Director",
            "members": [
                _person(
                    "Prof. Dr. rer. nat. Dr. rer. med. habil. Daniel J. Strauss",
                    "Director",
                    "daniel.strauss@uni-saarland.de",
                    UKS,
                    "Neurocenter (Building 90.5)",
                    HOMBURG,
                    icon="fa-user-tie",
                ),
            ],
        },
        {
            "id": "deputy-director",
            "name": "Deputy Director",
            "members": [
                _person(
                    "Dr. Lars Haab",
                    "Deputy Director",
                    "lars.haab@uni-saarland.de",
                    UKS,
                    "Neurocenter (Building 30)",
                    HOMBURG,
                    lab="Multiscale Lab",
                    icon="fa-user-shield",
                ),
            ],
        },
        {
            "id": "lab-heads",
            "name": "Lab Heads",
            "members": [
                _person(
                    "Dr. Farah I. Corona-Strauss",
                    "Lab Head",
                    "farah.coronastrauss@uni-saarland.de",
                    HTW,
                    "Technikum (Room 6214)",
                    SAARBRUECKEN,
                    lab="Mindscan Lab",
                    street=GOEBENSTRASSE,
                    icon="fa-flask",
                ),
                _person(
                    "Dr. Corinna Martin (née Bernarding)",
                    "Lab Head",
                    "corinna.bernarding@uni-saarland.de",
                    UKS,
                    "Neurocenter (Building 90.5)",
                    HOMBURG,
                    lab="Translational Lab",
                    icon="fa-flask",
                ),
                _person(
                    "Dr. Lars Haab",
                    "Lab Head",
                    "lars.haab@uni-saarland.de",
                    UKS,
                    "Neurocenter (Building 30)",
                    HOMBURG,
                    lab="Multiscale Lab",
                    icon="fa-flask",
                ),
                _person(
                    "Tobias Grün, M.Sc.",
                    "Lab Head",
                    "gruen@snn-unit.de",
                    HTW,
                    "Technikum (Room 6216)",
                    SAARBRUECKEN,
                    lab="Digital Realities Lab",
                    street=GOEBENSTRASSE,
                    icon="fa-flask",
                ),
            ],
        },
        {
            "id": "researchers",
            "name": "Contracted Researchers & PhD Students",
            "members": [
                _person("Leen Almasu, M.Sc.", "Contracted Researcher / PhD Student", "almasu@snn-unit.de", HTW, "Technikum (Room 6226)", SAARBRUECKEN, street=GOEBENSTRASSE),
                _person("Mayur Bhamborae Jayaram, M.Sc.", "Contracted Researcher / PhD Student", "bhamborae@snn-unit.de", HTW, "Technikum (Room 6225)", SAARBRUECKEN, street=GOEBENSTRASSE),
                _person("Tanja Biehl, M.Sc.", "Contracted Researcher / PhD Student", "biehl@snn-unit.de", HTW, "Technikum (Room 6226)", SAARBRUECKEN, street=GOEBENSTRASSE),
                _person("Sophie Bonnaire, M.Sc.", "Contracted Researcher / PhD Student", "bonnaire@snn-unit.de", HTW, "Technikum (Room 6225)", SAARBRUECKEN, street=GOEBENSTRASSE),
                _person("Benedikt Buchheit, M.Eng.", "Contracted Researcher / PhD Student", "buchheit@snn-unit.de", HTW, "Technikum (Room 6118)", SAARBRUECKEN, street=GOEBENSTRASSE),
                _person("Simon Volker Busch, M.Sc.", "Contracted Researcher / PhD Student", "busch@snn-unit.de", HTW, "Technikum (Room 6223)", SAARBRUECKEN, street=GOEBENSTRASSE),
                _person("Tajbeed A. Chowdhury, M.Sc.", "Contracted Researcher / PhD Student", "chowdhury@snn-unit.de", HTW, "Technikum (Room 6225)", SAARBRUECKEN, street=GOEBENSTRASSE),
                _person("Sabrina García Denis, M.Sc.", "Contracted Researcher / PhD Student", "garcia@snn-unit.de", UKS, "Neurocenter (Building 90.5)", HOMBURG),
                _person("Arief Harris, M.Sc.", "Contracted Researcher / PhD Student", "harris@snn-unit.de", UKS, "Neurocenter (Building 90.5)", HOMBURG, lab="Translational Lab"),
                _person("Selina Heller, M.Sc.", "Contracted Researcher / PhD Student", "heller@snn-unit.de", UKS, "Neurocenter (Building 90.5)", HOMBURG),
                _person("Caroline Lehser, M.Sc.", "Contracted Researcher / PhD Student", "lehser@snn-unit.de", HTW, "Technikum (Room 6216)", SAARBRUECKEN, street=GOEBENSTRASSE),
                _person("Chengpeng Li, M.Sc.", "Contracted Researcher / PhD Student", "Li@snn-unit.de", HTW, "Technikum (Room 6118)", SAARBRUECKEN, street=GOEBENSTRASSE),
                _person("Adrian Mai, M.Sc.", "Contracted Researcher / PhD Student", "mai@snn-unit.de", HTW, "Technikum (Room 6226)", SAARBRUECKEN, street=GOEBENSTRASSE),
                _person("Richard Morsch, M.Sc.", "Contracted Researcher / PhD Student", "morsch@snn-unit.de", UKS, "Neurocenter (Building 30)", HOMBURG),
                _person("Faraz Nizamani, M. Sc.", "Contracted Researcher / PhD Student", "nizamani@snn-unit.de", HTW, "Technikum (Room 6223)", SAARBRUECKEN, street=GOEBENSTRASSE),
                _person("Rohan Pathrave, M.Sc.", "Contracted Researcher / PhD Student", "pathrave@snn-unit.de", UKS, "Neurocenter (Building 30)", HOMBURG),
                _person("Laura Renz, M.Sc.", "Contracted Researcher / PhD Student", "renz@snn-unit.de", HTW, "Technikum (Room 6226)", SAARBRUECKEN, street=GOEBENSTRASSE),
                _person("Ing. Alejandro E. Romero Santiago, M.Sc.", "Contracted Researcher / PhD Student", "romero@snn-unit.de", UKS, "Neurocenter (Building 30)", HOMBURG, lab="Multiscale Lab"),
                _person("Patrick Schäfer, M.Sc.", "Contracted Researcher / PhD Student", "schaefer@snn-unit.de", HTW, "Technikum (Room 6224)", SAARBRUECKEN, lab="Mindscan Lab", street=GOEBENSTRASSE),
                _person("Elena N. Schneider, M.Sc.", "Contracted Researcher / PhD Student", "schneider@snn-unit.de", HTW, "Technikum (Room 6226)", SAARBRUECKEN, street=GOEBENSTRASSE),
                _person("Andreas Schröer, M.Sc.", "Contracted Researcher / PhD Student", "schroeer@snn-unit.de", HTW, "Technikum (Room 6225)", SAARBRUECKEN, street=GOEBENSTRASSE),
                _person("J. Kristof Schubert, M.Sc.", "Contracted Researcher / PhD Student", "schubert@snn-unit.de", UKS, "Neurocenter (Building 90.5)", HOMBURG, lab="Translational Lab"),
                _person("David Thinnes, M.Sc.", "Contracted Researcher / PhD Student", "thinnes@snn-unit.de", HTW, "Technikum (Room 6216)", SAARBRUECKEN, street=GOEBENSTRASSE),
                _person("José Antonio Trapero Escalante, M.Sc.", "Contracted Researcher / PhD Student", "jose.trapero@htwsaar.de", HTW, "Technikum (Room 6225)", SAARBRUECKEN, street=GOEBENSTRASSE),
                _person("Victor Daniel Treviño Stille, M.Sc.", "Contracted Researcher / PhD Student", "vitr004@uni-saarland.de", HTW, "Technikum (Room 6216)", SAARBRUECKEN, street=GOEBENSTRASSE),
                _person("Roger Alexis Vargas Perera, M.Sc.", "Contracted Researcher / PhD Student", "vargas@snn-unit.de", HTW, "Technikum (Room 6226)", SAARBRUECKEN, street=GOEBENSTRASSE),
                _person("Denis Wiegant, M.Sc.", "Contracted Researcher / PhD Student", "wiegant@snn-unit.de", HTW, "Technikum (Room 6118)", SAARBRUECKEN, street=GOEBENSTRASSE),
            ],
        },
    ],
}
PHONE_BY_NAME = {
    "Prof. Dr. rer. nat. Dr. rer. med. habil. Daniel J. Strauss": "+49 (0)6841 16 24090",
    "Dr. Lars Haab": "+49 (0)6841 16 26652",
    "Dr. Farah I. Corona-Strauss": "+49 (0)681 5867 798",
    "Dr. Corinna Martin (née Bernarding)": "+49 (0)681 5867 679",
    "Tobias Grün, M.Sc.": "+49 (0)681 5867 99073",
    "Leen Almasu, M.Sc.": "+49 (0)681 5867 99129",
    "Mayur Bhamborae Jayaram, M.Sc.": "+49 (0)681 5867 99128",
    "Tanja Biehl, M.Sc.": "+49 (0)681 5867 99129",
    "Sophie Bonnaire, M.Sc.": "+49 (0)681 5867 99079",
    "Benedikt Buchheit, M.Eng.": "+49 (0)681 5867 99131",
    "Simon Volker Busch, M.Sc.": "+49 (0)681 5867 796",
    "Tajbeed A. Chowdhury, M.Sc.": "+49 (0)681 5867 99128",
    "Sabrina García Denis, M.Sc.": "+49 (0)681 5867 176",
    "Arief Harris, M.Sc.": "+49 (0)6841 16 24091",
    "Selina Heller, M.Sc.": "+49 (0)681 5867 176",
    "Caroline Lehser, M.Sc.": "+49 (0)681 5867 176",
    "Chengpeng Li, M.Sc.": "+49 (0)681 5867 99131",
    "Adrian Mai, M.Sc.": "+49 (0)681 5867 797",
    "Richard Morsch, M.Sc.": "+49 (0)681 5867 679",
    "Faraz Nizamani, M. Sc.": "+49 (0)681 5867 796",
    "Rohan Pathrave, M.Sc.": "+49 (0)681 5867 679",
    "Laura Renz, M.Sc.": "+49 (0)681 5867 99129",
    "Ing. Alejandro E. Romero Santiago, M.Sc.": "+49 (0)6841 16 24091",
    "Patrick Schäfer, M.Sc.": "+49 (0)6841 16 24091",
    "Elena N. Schneider, M.Sc.": "+49 (0)681 5867 797",
    "Andreas Schröer, M.Sc.": "+49 (0)681 5867 99078",
    "J. Kristof Schubert, M.Sc.": "+49 (0)6841 16 24091",
    "David Thinnes, M.Sc.": "+49 (0)681 5867 99130",
    "José Antonio Trapero Escalante, M.Sc.": "+49 (0)681 5867 99079",
    "Victor Daniel Treviño Stille, M.Sc.": "+49 (0)681 5867 99130",
    "Roger Alexis Vargas Perera, M.Sc.": "+49 (0)681 5867 797",
    "Denis Wiegant, M.Sc.": "+49 (0)681 5867 99131",
}

PHOTO_BY_NAME = {
    "Prof. Dr. rer. nat. Dr. rer. med. habil. Daniel J. Strauss": "/image/people/daniel_j_strauss.png",
    "Dr. Lars Haab": "/image/people/lars_haab.png",
    "Dr. Farah I. Corona-Strauss": "/image/people/farah_i_corona_strauss.png",
    "Dr. Corinna Martin (née Bernarding)": "/image/people/corinna_martin_nee_bernarding.png",
    "Tobias Grün, M.Sc.": "/image/people/tobias_grun_m.jpg",
    "Leen Almasu, M.Sc.": "/image/people/leen_almasu_m.png",
    "Mayur Bhamborae Jayaram, M.Sc.": "/image/people/mayur_bhamborae_jayaram_m.jpg",
    "Tanja Biehl, M.Sc.": "/image/people/tanja_biehl_m.jpg",
    "Sophie Bonnaire, M.Sc.": "/image/people/sophie_bonnaire_m.png",
    "Benedikt Buchheit, M.Eng.": "/image/people/benedikt_buchheit_m_eng.jpg",
    "Simon Volker Busch, M.Sc.": "/image/people/simon_volker_busch_m.jpg",
    "Tajbeed A. Chowdhury, M.Sc.": "/image/people/tajbeed_a_chowdhury_m.png",
    "Sabrina García Denis, M.Sc.": "/image/people/sabrina_garcia_denis_m.jpg",
    "Arief Harris, M.Sc.": "/image/people/arief_harris_m.png",
    "Selina Heller, M.Sc.": "/image/people/selina_heller_m.png",
    "Caroline Lehser, M.Sc.": "/image/people/caroline_lehser_m.jpg",
    "Chengpeng Li, M.Sc.": "/image/people/chengpeng_li_m.jpg",
    "Adrian Mai, M.Sc.": "/image/people/adrian_mai_m.jpg",
    "Richard Morsch, M.Sc.": "/image/people/richard_morsch_m.png",
    "Faraz Nizamani, M. Sc.": "/image/people/faraz_nizamani_m.jpg",
    "Rohan Pathrave, M.Sc.": "/image/people/rohan_pathrave_m.png",
    "Laura Renz, M.Sc.": "/image/people/laura_renz_m.jpg",
    "Ing. Alejandro E. Romero Santiago, M.Sc.": "/image/people/alejandro_e_romero_santiago_m.png",
    "Patrick Schäfer, M.Sc.": "/image/people/patrick_schafer_m.png",
    "Elena N. Schneider, M.Sc.": "/image/people/elena_n_schneider_m.jpg",
    "Andreas Schröer, M.Sc.": "/image/people/andreas_schroer_m.jpg",
    "J. Kristof Schubert, M.Sc.": "/image/people/j_kristof_schubert_m.png",
    "David Thinnes, M.Sc.": "/image/people/david_thinnes_m.jpg",
    "José Antonio Trapero Escalante, M.Sc.": "/image/people/jose_antonio_trapero_escalante_m.jpg",
    "Victor Daniel Treviño Stille, M.Sc.": "/image/people/victor_daniel_trevino_stille_m.jpg",
    "Roger Alexis Vargas Perera, M.Sc.": "/image/people/roger_alexis_vargas_perera_m.jpg",
    "Denis Wiegant, M.Sc.": "/image/people/denis_wiegant_m.png",
}

for category in PEOPLE_DATA["categories"]:
    for member in category["members"]:
        member["phone"] = PHONE_BY_NAME[member["name"]]
        member["photo"] = PHOTO_BY_NAME.get(member["name"], "")
