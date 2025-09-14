
class EventProcessor:
    def __init__(self, kafka_message: dict):
        """
        Initialize EventProcessor with a Kafka message.
        :param kafka_message: dict containing event data
        """
        self.kafka_message = kafka_message

     

    def process_event(self):
        """
        Process the Kafka event and return a structured event dict.
        :return: dict with processed event data
        """
        event = {
            "person_id": self.kafka_message.get("person_id"),
            "time": self.kafka_message.get("time"),
            "level": self.calculate_level(self.kafka_message.get("Appears", {})),
            "image_id": self.kafka_message.get("image_id"),
            "camera_id": self.kafka_message.get("camera_id"),
            "message": self.create_description(self.kafka_message)
        }
        return event


    @staticmethod
    def calculate_level(Appears: dict):
        """
        Business logic for risk level based on recent and historical appearances.
        :param Appears: dict with appearance counts ("Today", "This week", "This month", "This year")
        :return: str level ('alert', 'active', 'inactive', 'approved', 'pending', 'first')
        """
        today = Appears.get("Today", 0)
        week = Appears.get("This week", 0)
        month = Appears.get("This month", 0)
        year = Appears.get("This year", 0)

        if today + week + month + year <= 1:# first ever appearance
            return "alert"  

        if today >= 3 or week >= 5:
            if month >= 10 or year >= 20:
                return "approved"  # many appearances both recently and historically
            return "active"  # recent frequent appearances

        if (month >= 5 or year >= 10) and today == 0 and week == 0:
            return "inactive"  # was seen in the past, not recently

        if 2 <= (today + week + month + year) <= 4:
            return "pending"  # few appearances

        return "unknown"  # unclassified

    @staticmethod
    def create_description(msg):
        """
        Create a description string for the event.
        :param msg: dict with event data
        :return: str description
        """
        return f"Person {msg.get('person_id')} detected by camera {msg.get('camera_id')} on {msg.get('time')}."




