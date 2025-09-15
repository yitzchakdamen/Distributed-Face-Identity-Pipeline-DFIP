
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
        Calculate the level of the event based on appearance statistics.
        :param Appears: dict with appearance counts
        """
        today = Appears.get("Today", 0)
        week = Appears.get("This week", 0)
        month = Appears.get("This month", 0)
        year = Appears.get("This year", 0)

        if  week == today and month == today and year == today :
            return "alert"  # only seen today

        if week - today < 3:
            if month >= 10 or year >= 20:
                return "approved"  # many appearances both recently and historically
            return "active"  # recent frequent appearances

        if (month >= 5 or year >= 10) and today >= 2 and week == 0:
            return "inactive"  # was seen in the past, not recently

        return "unknown"  # unclassified

    @staticmethod
    def create_description(msg):
        """
        Create a description string for the event.
        :param msg: dict with event data
        :return: str description
        """
        return f"Person {msg.get('person_id')} detected by camera {msg.get('camera_id')} on {msg.get('time')}."




