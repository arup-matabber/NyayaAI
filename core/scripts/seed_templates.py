import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from core.engine.db.database import SessionLocal, engine, Base
from core.engine.db.models import Template, Case

BAIL_PLATYPUS_TEMPLATE = r"""<font size="16"><b>IN THE HON'BLE HIGH COURT OF [COURT_LOCATION] AT [COURT_CITY]</b></font>

<b><font size="14">CRIMINAL MISC. BAIL APPLICATION NO. _____ OF 2026</font></b>

<font size="12">(Under Section 483 of Bharatiya Nagarik Suraksha Sanhita, 2023)</font>

<b>----------</b>

<b>IN THE MATTER OF:</b>
[APPLICANT_NAME] [GENDER_PREFIX] [FATHER_NAME], R/o [ADDRESS]
... APPLICANT

<b>VERSUS</b>

[RESPONDENT_STATE]
... RESPONDENT

<b>----------</b>

<b><u><font size="14">APPLICATION FOR GRANT OF REGULAR BAIL</font></u></b>

<b>MOST RESPECTFULLY SHOWETH TO THE HON'BLE CHIEF JUSTICE AND HIS COMPANION JUDGES:</b>
[DYNAMIC_BODY_CONTENT]

<b>[ADVOCATE_NAME]</b>
ADVOCATE FOR APPLICANT
[BAR_COUNCIL_NO]

<b>VERIFICATION:</b>
I, [APPLICANT_NAME], the above-named Applicant, do hereby solemnly affirm and declare that the contents of this Bail Application are true and correct to the best of my knowledge, belief, and information, and nothing material has been concealed therefrom.

<b>DEPONENT / APPLICANT</b>"""

CRIMINAL_COMPLAINT_PLATYPUS_TEMPLATE = r"""BEFORE THE COURT OF CHIEF METROPOLITAN MAGISTRATE, [COURT_CITY]

APPLICATION UNDER SECTION 175(3) OF THE BHARATIYA NAGARIK SURAKSHA SANHITA (BNSS), 2023

IN THE MATTER OF:

COMPLAINANT:
[APPLICANT_NAME], R/o [ADDRESS]

VERSUS

ACCUSED:
[DEFENDANT_NAME], [DEFENDANT_ADDRESS]

----------
[DYNAMIC_TITLE]

MOST RESPECTFULLY SHOWETH:

[DYNAMIC_BODY_CONTENT]

[ADVOCATE_NAME]
ADVOCATE FOR COMPLAINANT
[BAR_COUNCIL_NO]

VERIFICATION:
I, the above-named complainant, do hereby solemnly affirm and declare that the contents of this criminal complaint are true and correct based on personal knowledge, physical facts, and verified digital transaction records.

DEPONENT / COMPLAINANT"""


CIVIL_SUIT_PLATYPUS_TEMPLATE = r"""IN THE COURT OF THE DISTRICT JUDGE, [COURT_CITY]

CIVIL SUIT NO. _____ OF 2026

IN THE MATTER OF:

PLAINTIFF:
[APPLICANT_NAME], R/o [ADDRESS] 

VERSUS

DEFENDANT:
[DEFENDANT_NAME], R/o [DEFENDANT_ADDRESS]

----------

[DYNAMIC_TITLE]

MOST RESPECTFULLY SHOWETH:

[DYNAMIC_BODY_CONTENT]

[ADVOCATE_NAME]
ADVOCATE FOR PLAINTIFF
[BAR_COUNCIL_NO]

VERIFICATION:
Verified at [COURT_CITY] on this day that the contents of the above paragraphs are true and correct to the best of my knowledge, and nothing material has been concealed therefrom.

DEPONENT / PLAINTIFF"""

def seed_templates():
    print("Initiating Master Platypus Document Template Injection (Multi-Template Layouts)...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    db.query(Template).delete()
    
    templates = [
        Template(court_type="High Court", document_type="Bail Application", latex_content=BAIL_PLATYPUS_TEMPLATE.strip(), version_number=4),
        Template(court_type="Magistrate Court", document_type="Criminal Complaint", latex_content=CRIMINAL_COMPLAINT_PLATYPUS_TEMPLATE.strip(), version_number=1),
        Template(court_type="District Court", document_type="Civil Suit", latex_content=CIVIL_SUIT_PLATYPUS_TEMPLATE.strip(), version_number=1)
    ]
    
    db.bulk_save_objects(templates)
    db.commit()
    db.close()
    print(" -> Injected: Bail Application, Criminal Complaint, and Civil Suit Templates.")

if __name__ == "__main__":
    seed_templates()
