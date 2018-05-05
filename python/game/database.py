#!/usr/bin/env python3
import logging
from logging.handlers import RotatingFileHandler
from sqlite3 import Connection
from typing import List, Tuple

log = logging.getLogger(__name__)
handler = RotatingFileHandler("{}.log".format(__name__), maxBytes=1280000, backupCount=1)
handler.setFormatter(logging.Formatter("[%(asctime)s] {%(name)s:%(lineno)d} %(levelname)s - %(message)s"))
handler.setLevel(logging.DEBUG)
log.addHandler(handler)

max_time = 9999999


class Row(dict):
    """
    An object representing a single row from the database
    """

    def __init__(self, key: int = None, name=None, lasers: bin = None, code: hex = None, color: str = None,
                 time: int = None, success: bool = None):
        dict.__init__(self)
        self["id"] = key
        self["name"] = name
        self["lasers"] = lasers
        self["code"] = code
        self["color"] = color
        # TODO Convert timestamp
        self["time"] = time
        self["success"] = success
        # Add dict values to namespace
        self.__dict__.update(self)

    def __str__(self):
        return "{id}, {name}, {lasers}, {code}, {color}, {time}, {success}".format(
            id=self.id, name=self.name, lasers=bin(self.lasers),
            code=hex(self.code), color=self.color, time=self.time, success=bool(self.success)
        )


class Database(Connection):
    FILE = "game/scores.db"

    def __init__(self):
        # if does not exist, format / create tables
        super().__init__(self.FILE)
        self.cur = self.cursor()

        # The TIME is the number on the clock when the game ended in success or failure
        self._execute(
            """
            CREATE TABLE IF NOT EXISTS DATA (
                 ID INTEGER PRIMARY KEY AUTOINCREMENT ,
                 NAME VARCHAR,
                 LASERS INT NOT NULL,
                 CODE INT NOT NULL,
                 COLOR VARCHAR NOT NULL,
                 TIME INT NOT NULL,
                 SUCCESS BOOL NOT NULL
            )
            """
        )
        self.commit()

    def __del__(self):
        log.debug("Closing connection to database")
        self.close()

    def __str__(self):
        return """Solves:\n{}\n\nTotal Failures: {}
        """.format(
            "\n".join(str(x) for x in self.get_rows(success=True)),
            len(self.get_rows(success=False))
        )

    def _execute(self, *args, **kwargs):
        log.debug("SQLITE:{}".format(" ".join([str(x) for x in args])))
        return self.cur.execute(*args, **kwargs)

    def add_row(self, item: Row):
        """
        Append a row to the database
        :param item: a Row object
        """
        # Brief Error checking for columns that cannot be null
        if item.time is None:
            item.time = max_time
        if item.success is None:
            item.success = False

        self._execute("INSERT INTO DATA (NAME, LASERS, CODE, COLOR, TIME, SUCCESS) VALUES (?, ?, ?, ?, ?, ?)", (
            item.name, item.lasers, item.code, item.color, item.time, item.success,))
        self.commit()

    @property
    def last(self) -> Row:
        """
        :return: A row object representing the last row in the database
        """
        self._execute("SELECT * FROM DATA WHERE ID = (SELECT max(ID) FROM DATA)")
        return Row(*self.cur.fetchone())

    @last.setter
    def last(self, item: Row):
        """
        # Modify the last row of the database to contain the values that aren't None
        """
        for column, value in item.items():
            if value is not None:
                print("Setting last row's {} to '{}'".format(column, value))
                self._execute("UPDATE DATA SET {col} = {q}{val}{q} WHERE ID = (SELECT MAX(ID) FROM DATA)".format(
                    col=column.upper(), val=value, q="'" if isinstance(value, str) else ""
                ))
            self.commit()

    def get_rows(self, lasers: int = None, code: hex = None, color: str = None, name: str = None, time: int = None,
                 success: bool = None) -> List[Row]:
        """
        Select rows based on columns.  If 'None' is given, then all rows will be selected.
        :param lasers: Select rows with this laser configuration
        :param code: Select rows with the same code
        :param color: Select rows with the same color color
        :param name: Select rows with the same name
        :param time: Select rows with a time equal to or less than the given number
        :param success: Select rows with success or failure
        :return: A list of rows
        """
        # TODO select based on the given parameters and convert the data to a list of rows
        self._execute(
            "SELECT  * FROM DATA"
        )
        return [Row(*x) for x in self.cur.fetchall()]
