from enum import IntEnum

from i2c import SMBus
from i2c.i2c_module import I2CModule


class COLOR(IntEnum):
    BLANK = 0b0000000
    RED = 0b11100000
    GREEN = 0b00011100
    BLUE = 0b0000011


class ArduinoI2C(I2CModule):
    ADDRESS = 0x69
    NO_DATA = "."

    def __init__(self, bus: SMBus):
        I2CModule.__init__(self, bus, self.ADDRESS)
        self.current_color = COLOR.BLANK

    def RGB(self, color: COLOR):
        self.current_color = color
        self.write_byte(color)

    @property
    def keypad(self) -> chr:
        # TODO device won't read data unless listening on serial too
        success, data = self.read_bytes(16)
        if success and data[0] != self.NO_DATA:
            return [chr(x) for x in data]
        else:
            return []


if __name__ == "__main__":
    from time import sleep

    device = ArduinoI2C(SMBus(1))

    # Test RGB
    for c in COLOR:
        device.RGB(c)
        sleep(1)
    device.RGB(COLOR.BLANK)

    # Test Keypad
    while True:
        sleep(1)
        rcv = device.keypad
        if rcv:
            print(rcv)
