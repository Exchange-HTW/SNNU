from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class HeroSchema(BaseModel):
    title: str = Field(description="The main hero title")
    videoSrc: str = Field(description="The source URL for the hero video")

class LabSchema(BaseModel):
    id: int
    name: str = Field(description="Name of the laboratory")
    desc: str = Field(description="Short description of the laboratory's focus")
    icon: str = Field(description="FontAwesome icon class, e.g., 'fa-microscope'")

class ResearchSiteSchema(BaseModel):
    title: str = Field(description="Title for the research site section")
    labs: List[LabSchema] = Field(description="List of laboratories")

class VirtualTourSchema(BaseModel):
    title: str = Field(description="Title of the virtual tour section")
    header: str = Field(description="Header text for the 360 viewer")

class PersonSchema(BaseModel):
    name: str = Field(description="Full name of the person with academic titles")
    role: str = Field(description="Role or position")
    icon: str = Field(description="FontAwesome icon class, e.g., 'fa-user-tie'")
    email: Optional[str] = Field(default=None, description="Contact email address")
    phone: Optional[str] = Field(default=None, description="Contact phone number")
    photo: Optional[str] = Field(default=None, description="Path to profile photo, e.g., '/image/people/name.jpg'")
    lab: Optional[str] = Field(default=None, description="Laboratory the person belongs to")
    unit: Optional[str] = Field(default=None, description="Academic unit")
    institution: Optional[str] = Field(default=None, description="Institution or hospital")
    building: Optional[str] = Field(default=None, description="Building and room")
    street: Optional[str] = Field(default=None, description="Street address")
    location: Optional[str] = Field(default=None, description="Postal code, city and country")
    bio: Optional[str] = Field(default=None, description="Short biography")
    publications: Optional[List[str]] = Field(default=None, description="List of relevant publications")
    links: Optional[Dict[str, str]] = Field(default=None, description="External links: researchgate, linkedin, scholar, website")

class PeopleCategorySchema(BaseModel):
    name: str = Field(description="Category name (e.g., Director, Lab Heads)")
    members: List[PersonSchema]

class PeopleSchema(BaseModel):
    title: str = Field(description="Title for the people section")
    subtitle: str = Field(description="Subtitle for the people section")
    categories: List[PeopleCategorySchema]

class NewsSchema(BaseModel):
    title: str = Field(description="Title for the news section")
    subtitle: str = Field(description="Subtitle for the news section")

class ExtraSectionSchema(BaseModel):
    id: str = Field(description="HTML id for the section")
    title: str = Field(description="Title of the section")
    icon: str = Field(description="FontAwesome icon class")
    text: str = Field(description="Brief text description of the section")

class PageSchema(BaseModel):
    hero: HeroSchema
    researchSite: ResearchSiteSchema
    virtualTour: VirtualTourSchema
    people: PeopleSchema
    news: NewsSchema
    sections: List[ExtraSectionSchema]
