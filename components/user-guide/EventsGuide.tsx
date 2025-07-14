import React from 'react';
import InfoBox from './InfoBox';

const EventsGuide: React.FC = () => {
  return (
    <div>
      <h2>Events & Venues</h2>
      <p>
        This section is a dedicated module for managing all aspects of your public-facing events, from the places they happen to the tickets you sell. It is broken into three tabs: <code>Events</code>, <code>Venues</code>, and <code>Ticket Types</code>.
      </p>

      <h3>Events</h3>
      <p>
        This is where you create and manage individual events, like performances, workshops, or fundraisers. The main page shows a filterable list of all your one-time events and individual occurrences of a recurring series.
      </p>
      <h4>Key Features:</h4>
      <ul>
        <li><strong>Create an Event:</strong> Click "Add New Event" to open the Event Editor. You can link it to a Project and a Venue.</li>
        <li><strong>Date & Time:</strong> Set the start/end dates and times. You can also mark an event as "All-day" to hide the time inputs.</li>
        <li><strong>Recurring Events:</strong> In the editor, use the "Set Up Recurrence Schedule" button to create a series of events (e.g., a weekly open mic night). You can define how often it repeats (daily, weekly, monthly) and when the series ends. This creates a "template" event and all its future occurrences.</li>
        <li><strong>Editing a Series:</strong> When you edit an event that is part of a series, you'll be asked if you want to edit <strong>just that single occurrence</strong> or the <strong>entire series</strong>. Editing a single occurrence breaks its link from the template, protecting it from future series-wide changes.</li>
        <li><strong>Ticket Assignment:</strong> Once an event is created, you can assign different "Ticket Types" to it, setting the price and capacity for that specific event.</li>
      </ul>
      <InfoBox type="info">
        <p><strong>How Ticket Revenue Works:</strong> The total projected revenue from ticket sales is automatically calculated based on the price and capacity of all tickets you assign to an event. This projection is then displayed in the Project's budget tab, saving you from manual calculations.</p>
      </InfoBox>
      <h3>Venues</h3>
      <p>
        This is your address book for all the physical or virtual places where your events might take place. Creating venues here allows you to easily reuse them across multiple events and projects.
      </p>
      <h4>Key Features:</h4>
      <ul>
        <li><strong>Add a Venue:</strong> Create a new venue by providing its name, address, and contact information.</li>
        <li><strong>Default Cost:</strong> You can set a default rental cost for a venue (e.g., $500 / day). When you assign this venue to an event, this cost will be suggested automatically, but you can override it for each specific event.</li>
        <li><strong>Virtual Venues:</strong> You can mark a venue as "virtual" for online events, which simplifies the address fields.</li>
      </ul>
      
      <h3>Ticket Types</h3>
      <p>
        This tab allows you to create reusable ticket categories. Instead of typing "General Admission" every time, you can create it here once and reuse it for all your events.
      </p>
      <h4>Key Features:</h4>
      <ul>
        <li><strong>Create a Type:</strong> Click "Add New Ticket Type" and give it a name (e.g., "Student Admission", "VIP Pass").</li>
        <li><strong>Default Price:</strong> Set a default price for the ticket type. This price will be suggested when you add this ticket to an event, but you can always change it for a specific performance.</li>
        <li><strong>Free Tickets:</strong> You can mark a ticket type as "Free" for tracking RSVPs to non-ticketed events.</li>
      </ul>
    </div>
  );
};

export default EventsGuide;