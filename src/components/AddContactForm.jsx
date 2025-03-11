import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { DatePicker } from "./ui/date-picker";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/card";

const AddContactForm = ({ onAddContact, editContact, onCancelEdit }) => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    birthday: null,
    anniversary: null,
    personality: "",
    career: ""
  });

  useEffect(() => {
    if (editContact) {
      setFormData({
        ...editContact,
        birthday: editContact.birthday ? new Date(editContact.birthday) : null,
        anniversary: editContact.anniversary ? new Date(editContact.anniversary) : null
      });
    }
  }, [editContact]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const contactData = {
      ...formData,
      id: formData.id || Date.now().toString(),
      birthday: formData.birthday ? formData.birthday.toISOString() : null,
      anniversary: formData.anniversary ? formData.anniversary.toISOString() : null
    };
    
    onAddContact(contactData);
    
    // Reset form
    setFormData({
      id: "",
      name: "",
      birthday: null,
      anniversary: null,
      personality: "",
      career: ""
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{editContact ? "Edit Contact" : "Add New Contact"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              required
              className="input-field"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="birthday">Birthday</Label>
            <DatePicker
              date={formData.birthday}
              setDate={(date) => setFormData({ ...formData, birthday: date })}
              className="date-picker"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="anniversary">Anniversary (Optional)</Label>
            <DatePicker
              date={formData.anniversary}
              setDate={(date) => setFormData({ ...formData, anniversary: date })}
              className="date-picker"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="personality">Personality</Label>
            <Input
              id="personality"
              name="personality"
              value={formData.personality}
              onChange={handleChange}
              placeholder="Describe their personality (e.g., cheerful, thoughtful)"
              className="input-field"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="career">Career</Label>
            <Input
              id="career"
              name="career"
              value={formData.career}
              onChange={handleChange}
              placeholder="Their profession or career"
              className="input-field"
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {editContact && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancelEdit}
              className="cancel-button"
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit"
            className="submit-button"
          >
            {editContact ? "Update Contact" : "Add Contact"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AddContactForm;
